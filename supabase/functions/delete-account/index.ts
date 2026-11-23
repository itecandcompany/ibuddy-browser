import { authenticate, json, options, readBoundedJson } from "../_shared/security.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const auth = await authenticate(req); if (auth instanceof Response) return auth;
  const body = await readBoundedJson(req, 1000); if (body instanceof Response) return body;
  const payload = body.value;
  if (typeof payload !== "object" || payload === null || (payload as Record<string, unknown>).confirm !== "DELETE_MY_ACCOUNT") {
    return json({ error: "Explicit account deletion confirmation is required." }, 400);
  }
  const { error } = await auth.admin.auth.admin.deleteUser(auth.userId);
  if (error) return json({ error: "The account could not be deleted. Your data has not been reported as deleted." }, 502);
  return json({ deleted: true });
});
