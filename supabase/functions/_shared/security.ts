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

export async function authenticate(req: Request): Promise<AuthContext | Response> {
  const authorization = req.headers.get("Authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return json({ error: "Sign in is required.", code: "AUTH_REQUIRED" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  let defaultSecret: string | undefined;
  if (secretKeysRaw) { try { defaultSecret = JSON.parse(secretKeysRaw)?.default; } catch { /* invalid secret map is treated as missing */ } }
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
  "forms.gle", "docs.google.com", "exam.net", "respondus.com", "honorlock.com",
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
  if (parsed.protocol !== "https:") return json({ error: "Only HTTPS page content is accepted." }, 400);
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

export async function callModel(messages: Array<{ role: "system" | "user" | "assistant"; content: string | Array<Record<string, unknown>> }>, maxTokens = 900): Promise<string> {
  const endpoint = Deno.env.get("AI_PROVIDER_URL");
  const apiKey = Deno.env.get("AI_PROVIDER_API_KEY");
  const model = Deno.env.get("AI_MODEL");
  if (!endpoint || !apiKey || !model) throw new Error("AI provider is not configured. Set AI_PROVIDER_URL, AI_PROVIDER_API_KEY and AI_MODEL as Supabase Edge Function secrets.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) {
    const safeStatus = response.status;
    throw new Error(`AI provider request failed (HTTP ${safeStatus}).`);
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("AI provider returned no readable text.");
  return content.slice(0, 16_000);
}

export function redactText(value: string): string {
  return value
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, "[redacted-token]")
    .replace(/(api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*[^\s&]+/ig, "$1=[redacted]");
}
