# Phase 8 — Security audit and App Store preparation

## Implemented controls in source
- HTTPS-only WebView navigation; no TLS certificate bypass.
- User-triggered extraction only; no form values, passwords, hidden inputs, cookies or browser storage.
- Zod validation, payload bounds, one-time request ID, origin check and token redaction.
- User-selected image OCR; local Apple Vision first, explicit-consent server fallback.
- Supabase JWT verification enabled on every user-facing Edge Function.
- Server-side Assessment Lock checks for automatic domains and user-synced manual locks.
- Per-user atomic AI rate limit RPC; request limits and provider timeouts.
- Provider keys remain in Supabase Edge Function secrets; no client-side model key.
- RLS enabled on user-owned tables; foreign keys cascade on Auth user deletion.
- AI functions do not persist page snapshots, chat prompts, OCR images or outputs.

## Release blockers — do not claim production-ready
- [ ] Dedicated iBuddy Supabase project created and selected.
- [ ] Migrations applied and RLS tested with two distinct accounts.
- [ ] AI provider endpoint/model verified for text and image input; secrets configured.
- [ ] Edge Functions deployed and tested with valid, expired and missing JWTs.
- [ ] Apple Sign-In enabled in Apple Developer and Supabase; real device sign-in verified.
- [ ] CI workflow green; native iOS build and physical-device matrix completed.
- [ ] App Store privacy disclosures, account deletion URL/support contact, age rating and review notes completed.
- [ ] Privacy policy and terms reviewed by the publisher.
- [ ] Independent security review and penetration testing completed.

## Known limitations / review notes
- Automatic assessment-domain matching is a conservative deny list, not a universal exam detector. Users must manually lock any other graded/proctored domain.
- Manual locks are enforced by the Edge Functions only after they have synced to the user's server profile. The mobile app blocks locally before sync.
- WebView page extraction is not equivalent to Safari extension access. Cross-origin frames, canvas/image-only content and some PDFs may not be readable.
- iOS Apple Vision is native and requires a development build; Expo Go is not supported.
- No current iPhone build, App Store submission or production backend deployment is claimed.
