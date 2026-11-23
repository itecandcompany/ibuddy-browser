import { authenticate, json, options } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const auth = await authenticate(req); if (auth instanceof Response) return auth;
  const raw = await req.text();
  if (raw.length > 1000) return json({ error: "Invalid request." }, 400);
  let body: unknown; try { body = raw ? JSON.parse(raw) : {}; } catch { return json({ error: "Invalid JSON." }, 400); }
  if (typeof body !== "object" || body === null || (body as Record<string, unknown>).confirm !== "DELETE_MY_ACCOUNT") {
    return json({ error: "Explicit account deletion confirmation is required." }, 400);
  }
  const { error } = await auth.admin.auth.admin.deleteUser(auth.userId);
  if (error) return json({ error: "The account could not be deleted. Your data has not been reported as deleted." }, 502);
  return json({ deleted: true });
});
