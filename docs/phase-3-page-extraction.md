# Phase 3 — User-selected page reading

## Implemented

- A visible **Read page** action starts extraction only after an explicit tap.
- The injected script reads only visible H1–H3 headings, paragraph text, and visible link labels/HTTPS URLs.
- Form controls and their values are not read. The script excludes forms, navigation, footers, hidden elements, scripts, styles, and templates.
- Link query strings and fragments are removed before the result is returned.
- Basic token-like strings and credential-labelled values are redacted.
- The payload is capped at 18 KB before it is sent over the WebView message bridge.
- Native code checks the message origin, validates the message with Zod, verifies the request ID, and rechecks Assessment Lock before displaying the content.
- The extracted preview is displayed locally. It is not uploaded or persisted.

## Not implemented yet

- Apple Vision OCR native module.
- User-selected screenshot/image import.
- OCR fallback through an authenticated backend.
- AI summaries, question classification, contextual chat, or highlights.

The OCR work requires an iOS native module and a custom development build. It must not be represented by a fake OCR response or a placeholder implementation.

## Security notes

- Extraction is disabled on pages blocked by Assessment Lock.
- A blocked page must not fall back to screenshot OCR or an alternate endpoint.
- The page can still be hostile. The extracted content is data only and must never be treated as model instructions.
- The WebView bridge is not an authorization boundary; all data must remain schema-validated and size-limited.
- Real-device iOS verification and hostile-page testing remain outstanding.

## Verification status

The repository includes unit tests for the extraction schema and script contract. They have not been executed in this remote editing session. Run `npm install`, `npm run typecheck`, and `npm test -- --runInBand` in a local development environment before treating this phase as verified.
