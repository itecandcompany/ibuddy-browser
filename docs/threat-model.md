# iBuddy Browser — Threat Model

## Assets

- Authentication tokens and user identity.
- Browsing history, bookmarks and saved analyses.
- User-selected screenshots and extracted page text.
- AI provider credentials and Supabase service credentials.
- WebView/native bridge integrity.

## Threats and mitigations

| Threat | Mitigation |
|---|---|
| Malicious page content / prompt injection | Treat page text as untrusted data; isolate it from system instructions and constrain model tasks. |
| Bridge spoofing | Validate schemas, sender origin and message types; expose no native functions to page JavaScript. |
| Secret leakage | Keep provider keys and service-role credentials exclusively in Edge Function secrets. |
| Sensitive form data exposure | Never extract typed values, password fields, hidden inputs or form control values; only visible labels are read. |
| WebView message flooding | Reject oversized messages before JSON parsing; validate strict Zod schemas and bounded field lengths. |
| Image privacy | Use the system photo picker; run OCR on-device with Apple Vision and do not upload or persist image bytes or OCR output in Phase 3. |
| Token leakage in page text | Redact token-like strings before server submission. |
| Assessment misuse | Assessment Lock blocks extraction, OCR and AI on locked tabs/domains; no in-app bypass. |
| Private browsing leakage | Do not persist private-tab history or analysis. |
| Unauthorized database access | Enable RLS on every user-owned table and scope rows to auth.uid(); message policies also verify conversation ownership. |
| Oversized or abusive AI requests | JWT verification, Zod validation, atomic per-user rate limits, provider timeouts and payload limits in Edge Functions. |
| TLS downgrade / certificate bypass | HTTPS-only navigation; no certificate-error override. |
| Credential-bearing URLs | Strip URL credentials and query/hash from extracted links; reject credential-bearing source URLs at the server. |
| Account data persistence | AI endpoints are stateless by default; optional saved-data tables are user-owned with RLS and cascade deletion. |
| Manual lock bypass | Server checks synced manual locks before AI calls; client blocks locally immediately. Unsynced manual locks are not server-known until sync completes. |

## Security invariants

- Analysis is always user-triggered and uses user-selected content only.
- No cross-app monitoring or covert capture.
- No automatic form submission or answer injection.
- No extraction of entered form values.
- Assessment Lock cannot be disabled from a locked tab.
- Unreadable content is reported as unreadable; the app must not guess.

## Verification plan

Security controls are not verified by documentation alone. Each control requires implementation tests and, where relevant, device testing and adversarial test cases. The security audit is scheduled for Phase 8.


## Phase 4–8 review notes
- All user-facing Edge Functions keep platform JWT verification enabled and also resolve the user through Supabase Auth.
- Service-role credentials are only read inside Edge Functions. The mobile app uses the publishable/anon key and a user session.
- The rate-limit RPC is not callable by anon/authenticated roles.
- User-owned tables have RLS policies; messages require both matching user_id and ownership of their parent conversation.
- The account deletion function requires an explicit confirmation phrase and deletes the Auth user; foreign keys cascade to user-owned records.
- AI requests are not persisted. The schema supports opt-in saved analyses and conversations, but the current AI functions do not write to those tables.
- Remaining review: run migrations, test RLS with two real users, validate provider model behavior, inspect native build output, run dynamic security tests, and commission an independent review.
