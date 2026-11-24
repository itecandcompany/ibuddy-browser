# Phase 4 — Authenticated AI backend

## Deployed functions

The dedicated Supabase project `ibuddy-browser` (`eaksjeretcxymiszowms`) is active. The following functions are deployed:

- `analyze-page`: page summary or grounded conceptual explanation.
- `chat`: context-grounded conversation using only the supplied snapshot.
- `ocr-fallback`: vision-capable OCR for an image the user explicitly chooses to upload.
- `delete-account`: explicit server-side Auth user deletion.

All four deployed functions currently require JWT verification. The shared server code also validates the bearer token with Supabase Auth, and provider credentials are read only by Edge Functions. Request payloads are bounded and validated. AI requests are not persisted. Per-user rate limiting uses an atomic Postgres RPC. The server checks automatic protected domains and the user's server-synced `locked_domains` before analysis.

## Provider contract

The deployed provider adapter uses:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (defaults to `gemini-2.5-flash`)
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (defaults to `openrouter/free`)

Gemini is tried first; OpenRouter is used if Gemini fails. Configure these values in Supabase Dashboard → Edge Functions → Secrets. The app must never contain provider API keys or Supabase service-role credentials.

Secret values are not readable through the project inspection integration. Confirm they exist in the dashboard and test a signed-in request before treating AI as verified.

## Database

Two migrations are applied:
- `ibuddy_security_and_privacy`
- `user_data_and_rls`

The project has the user-owned tables `profiles`, `user_settings`, `bookmarks`, `history`, `conversations`, `messages`, `analyses`, and `locked_domains`, plus the service-only `ibuddy_ai_rate_limits` table. RLS is enabled on all listed tables. The rate-limit table intentionally has no user-facing RLS policy; the service role accesses it from the Edge Functions.

## Remaining verification

1. Confirm provider secrets in Supabase Edge Function Secrets.
2. Sign in with a real test account and test page summary, chat and opt-in OCR.
3. Verify missing/expired JWTs are rejected and Assessment Lock returns 403.
4. Test rate limits and provider fallback behavior.
5. Test account deletion with a disposable account and verify cascade behavior.
6. Test RLS isolation with two distinct user accounts.

Do not treat deployed functions or active status alone as proof that provider requests, authentication flows or the iOS app have passed end-to-end testing.
