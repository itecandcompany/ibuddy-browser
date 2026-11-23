# Phase 3 — Page extraction and OCR

## Implemented

- User-triggered extraction of visible headings, paragraphs/list items, link labels and form labels.
- No extraction of typed form values, input values, password values, hidden inputs, cookies or browser storage.
- Zod validation for all messages returned from WebView, including bounded arrays, text lengths, HTTPS URLs and a request identifier.
- Active-page origin check and Assessment Lock check before accepting an extraction result.
- A local Expo native module using Apple's Vision framework for OCR of an image deliberately selected from the photo library.
- OCR results are displayed locally and are not persisted or uploaded in this phase.
- Local HTML fixture and expected JSON fixture for extraction tests.

## Limitations

- Cross-origin iframes are not traversed.
- Text rendered only into canvas, SVG or images is not available through DOM extraction.
- PDF text may not be available through the WebView DOM.
- OCR is currently implemented only for iOS. Android reports that the native Apple Vision implementation is unavailable.
- The server-side vision-model OCR fallback is not yet connected. It will be implemented with authenticated Edge Functions in Phase 4; this phase does not return fake fallback results.
- iOS native module compilation, CocoaPods autolinking, image picker behavior, device permissions and OCR accuracy have not been verified on a physical iPhone.

## Manual verification checklist

1. Open a normal HTTPS article and tap Read page. Confirm visible headings, paragraphs and links appear in the in-app preview.
2. Open a page with a form. Confirm only labels are extracted; values typed into fields are never shown.
3. Open a Google Forms page protected by Assessment Lock. Confirm Read page is disabled and no extraction request is sent.
4. Select a screenshot from Photos using OCR image. Confirm text is recognized on-device and shown in the OCR sheet.
5. Cancel the system photo picker and confirm no image is processed. Confirm iBuddy does not request broad photo-library access.
6. Try an image with no readable text and confirm the app reports no detected text rather than inventing content.
7. Test a page containing an iframe or image-only text and confirm limitations are disclosed.
8. Inspect network traffic and confirm page text, image bytes and OCR output are not uploaded by Phase 3.
9. Run npm install, npx expo prebuild --clean, npx expo run:ios, npm run typecheck, npm test and npm run lint on a Mac before marking this phase verified.