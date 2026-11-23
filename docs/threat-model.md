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
| Sensitive form data exposure | Never extract typed values, password fields, hidden inputs or form control values. |
| Token leakage in page text | Redact token-like strings before server submission. |
| Assessment misuse | Assessment Lock blocks extraction, OCR and AI on locked tabs/domains; no in-app bypass. |
| Private browsing leakage | Do not persist private-tab history or analysis. |
| Unauthorized database access | Enable RLS on every user-owned table and scope rows to auth.uid(). |
| Oversized or abusive AI requests | JWT verification, Zod validation, per-user rate limits and payload limits in Edge Functions. |
| TLS downgrade / certificate bypass | HTTPS-only navigation; no certificate-error override. |

## Security invariants

- Analysis is always user-triggered and uses user-selected content only.
- No cross-app monitoring or covert capture.
- No automatic form submission or answer injection.
- No extraction of entered form values.
- Assessment Lock cannot be disabled from a locked tab.
- Unreadable content is reported as unreadable; the app must not guess.

## Verification plan

Security controls are not verified by documentation alone. Each control requires implementation tests and, where relevant, device testing and adversarial test cases. The security audit is scheduled for Phase 8.
