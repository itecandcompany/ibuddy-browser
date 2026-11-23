# Phase 3 — User-triggered page reading and OCR

This document is retained as the focused page-extraction note. See docs/phase-3-extraction-ocr.md for the full Phase 3 implementation and device-verification checklist.

## Page extraction

- A visible Read page action starts extraction only after an explicit tap.
- The injected script reads visible headings, paragraphs/list items, link labels and form labels.
- It never reads typed form values, input values, password values, hidden inputs, cookies or browser storage.
- Link query strings and fragments are removed. Token-like strings and long token-like URL path segments are redacted.
- The result is capped at 24 KB before crossing the WebView message bridge.
- Native code checks the active page origin, Assessment Lock and request ID, then validates a strict bounded Zod schema.
- Extracted content is shown locally and is not uploaded or persisted.

## Image OCR

- iOS uses a local Expo native module backed by Apple's Vision framework.
- The user selects an image through the iOS system photo picker. iBuddy does not request broad photo-library access.
- OCR runs on-device. The image bytes and OCR output are not uploaded or persisted in this phase.
- Android does not yet have a native OCR implementation.
- Server-side vision OCR fallback is deferred to Phase 4 and is not simulated.

## Limitations and verification

- Cross-origin frames, canvas/image text and some PDF content may not be available to DOM extraction.
- The page is untrusted. WebView messages are data only, not authorization to invoke privileged native operations.
- The unit tests, iOS native build, CocoaPods autolinking, image picker and physical-device OCR accuracy have not been run in this remote editing session.
