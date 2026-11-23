# Phase 4 — Authenticated AI backend

## Functions
- `analyze-page`: page summary or grounded conceptual explanation.
- `chat`: context-grounded conversation using only the supplied snapshot.
- `ocr-fallback`: vision-capable OCR for an image the user explicitly chooses to upload.
- `delete-account`: explicit server-side Auth user deletion.

All functions require a valid Supabase user JWT. Provider credentials are read only by Edge Functions. Request payloads are bounded and validated. AI requests are not persisted. Per-user rate limiting uses an atomic Postgres RPC. The server checks automatic protected domains and the user's server-synced `locked_domains` before analysis.

## Provider contract
Configure an OpenAI-compatible chat-completions endpoint using Supabase Edge Function secrets:
- `AI_PROVIDER_URL`
- `AI_PROVIDER_API_KEY`
- `AI_MODEL`

The selected model must support text chat; the OCR fallback additionally requires image input. Provider-specific adapters can be added later without moving credentials into the app.

## Setup
1. Create a dedicated Supabase project for iBuddy.
2. Apply SQL migrations in timestamp order.
3. Set `AI_PROVIDER_URL`, `AI_PROVIDER_API_KEY`, and `AI_MODEL` in Supabase Edge Function secrets.
4. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` locally.
5. Deploy functions with JWT verification enabled.
6. Sign in and sync manually locked domains from Settings.

No live project has been selected or deployed from this repository yet. Never reuse another product's database or provider secrets.
