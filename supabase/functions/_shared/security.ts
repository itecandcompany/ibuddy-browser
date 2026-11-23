import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

export function options(req: Request): Response | null {
  return req.method === "OPTIONS" ? new Response("ok", { headers: corsHeaders }) : null;
}

export type AuthContext = { userId: string; admin: SupabaseClient };

export async function readBoundedJson(req: Request, maxBytes: number): Promise<{ value: unknown } | Response> {
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return json({ error: "Request payload is too large." }, 413);
  }
  const reader = req.body?.getReader();
  if (!reader) return json({ error: "Request body is required." }, 400);
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return json({ error: "Request payload is too large." }, 413);
      }
      chunks.push(value);
    }
  } catch {
    return json({ error: "Request body could not be read." }, 400);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    return { value: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
}


export async function authenticate(req: Request): Promise<AuthContext | Response> {
  const authorization = req.headers.get("Authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return json({ error: "Sign in is required.", code: "AUTH_REQUIRED" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const publishableKeysRaw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  let defaultPublishable: string | undefined;
  let defaultSecret: string | undefined;
  if (publishableKeysRaw) { try { defaultPublishable = JSON.parse(publishableKeysRaw)?.default; } catch { /* invalid key map is treated as missing */ } }
  if (secretKeysRaw) { try { defaultSecret = JSON.parse(secretKeysRaw)?.default; } catch { /* invalid key map is treated as missing */ } }
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? defaultPublishable;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? defaultSecret;
  if (!url || !anon || !service) return json({ error: "Server authentication is not configured." }, 503);

  const authClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await authClient.auth.getUser(match[1]);
  if (error || !data.user) return json({ error: "Your session is invalid or expired.", code: "INVALID_SESSION" }, 401);

  return {
    userId: data.user.id,
    admin: createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }),
  };
}

export async function enforceRateLimit(admin: SupabaseClient, userId: string, bucket: string, limit = 12): Promise<Response | null> {
  const { data, error } = await admin.rpc("ibuddy_consume_ai_rate_limit", {
    p_user_id: userId,
    p_bucket: bucket,
    p_limit: limit,
  });
  if (error) return json({ error: "Rate limiting is unavailable; request was not processed.", code: "RATE_LIMIT_UNAVAILABLE" }, 503);
  if (data !== true) return json({ error: "Too many requests. Wait a moment and try again.", code: "RATE_LIMITED" }, 429);
  return null;
}

const AUTOMATIC_LOCKED_HOSTS = [
  "forms.gle", "exam.net", "respondus.com", "honorlock.com",
  "proctorio.com", "proctoru.com", "examity.com", "inspera.com", "testinvite.com",
  "safeexambrowser.org",
];

function hostMatches(host: string, domain: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  const d = domain.toLowerCase().replace(/^www\./, "");
  return h === d || h.endsWith("." + d);
}

export async function assertPageUnlocked(admin: SupabaseClient, userId: string, rawUrl: string): Promise<Response | null> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { return json({ error: "A valid page URL is required." }, 400); }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) return json({ error: "Only credential-free HTTPS page content is accepted." }, 400);
  const host = parsed.hostname.toLowerCase();
  if (AUTOMATIC_LOCKED_HOSTS.some((domain) => hostMatches(host, domain)) ||
      (hostMatches(host, "docs.google.com") && /^\/forms(?:\/|$)/i.test(parsed.pathname))) {
    return json({ error: "Assessment Lock is active for this page. Page analysis is unavailable.", code: "ASSESSMENT_LOCKED" }, 403);
  }

  const { data, error } = await admin.from("locked_domains").select("domain").eq("user_id", userId).eq("is_locked", true);
  if (error) return json({ error: "Assessment Lock policy could not be checked; analysis was blocked.", code: "LOCK_POLICY_UNAVAILABLE" }, 503);
  if ((data ?? []).some((row: { domain: string }) => hostMatches(host, row.domain))) {
    return json({ error: "Assessment Lock is active for this page. Page analysis is unavailable.", code: "ASSESSMENT_LOCKED" }, 403);
  }
  return null;
}

async function requestGeminiCompletion(
  messages:Array<{role:"system"|"user"|"assistant";content:string|Array<Record<string,unknown>>}>,
  maxTokens:number,
):Promise<string>{
  const apiKey=Deno.env.get("GEMINI_API_KEY");
  if(!apiKey) throw new Error("Gemini is not configured. Add GEMINI_API_KEY in Supabase Edge Function Secrets.");
  const model=Deno.env.get("GEMINI_MODEL")??"gemini-2.5-flash";
  const response=await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",{
    method:"POST",
    headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
    body:JSON.stringify({model,messages,temperature:0.2,max_tokens:maxTokens}),
    signal:AbortSignal.timeout(35_000),
  });
  if(!response.ok){
    if(response.status===429) throw new Error("Gemini's free usage limit has been reached. Please wait and try again.");
    if(response.status===401||response.status===403) throw new Error("Gemini rejected the API key. Check GEMINI_API_KEY in Supabase Secrets.");
    throw new Error(`Gemini request failed (HTTP ${response.status}). Please try again shortly.`);
  }
  const payload=await response.json();
  const content=payload?.choices?.[0]?.message?.content;
  if(typeof content!=="string"||!content.trim()) throw new Error("Gemini returned no readable text. Please try again.");
  return content.slice(0,16_000);
}

export async function callModel(
  messages:Array<{role:"system"|"user"|"assistant";content:string|Array<Record<string,unknown>>}>,
  maxTokens=900,
):Promise<string>{
  try{return await requestGeminiCompletion(messages,maxTokens);}
  catch(error){
    const message=error instanceof Error?error.message:"Unknown Gemini error.";
    throw new Error(`iBuddy AI is temporarily unavailable. ${message}`);
  }
}

export function redactText(value: string): string {
  return value
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, "[redacted-token]")
    .replace(/(api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*[^\s&]+/ig, "$1=[redacted]");
}
