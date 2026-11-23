# iBuddy Browser — Architecture

## Product boundary

iBuddy is an iPhone-first browser with user-triggered page understanding. It only analyzes content the user deliberately submits and is not designed to monitor other apps or evade website or assessment restrictions.

## Phase 1 foundation

- Expo SDK 54 / React Native 0.81 baseline.
- Expo Router file-based navigation.
- TypeScript strict mode and @/* path alias.
- Shared design tokens in src/theme.
- Development-build workflow; Expo Go is not the target runtime.

## Phase 2 browser shell

- react-native-webview provides the browsing surface.
- URL handling accepts HTTPS URLs, adds HTTPS to domain-like input, and sends ordinary text to DuckDuckGo search.
- HTTP and unsupported schemes are blocked rather than silently upgraded.
- Tabs retain their own URL/title and mount the active tab in the WebView. Switching tabs currently reloads the selected URL rather than preserving each page's in-memory state; private tabs do not add browsing history.
- History, bookmarks and user-defined locked domains are persisted locally with AsyncStorage.
- Assessment Lock is evaluated before any future extraction/OCR/AI work. Google Forms assessment URLs and selected proctoring domains are automatically locked.
- Phase 3 adds explicit user-triggered DOM extraction and a local Apple Vision OCR module for user-selected images. There is no AI provider call or server-side OCR fallback until Phase 4.

## Phase 3 extraction and OCR

- DOM extraction runs only after an explicit user action and only when Assessment Lock is inactive.
- The injected script reads visible headings, paragraphs/list items, link labels and form labels. It never reads form values, input values, password values, hidden inputs, cookies or browser storage.
- WebView messages are treated as untrusted, validated with Zod, bounded in size and checked against the active page origin and one-time request ID.
- User-selected images are passed to an iOS-only local Expo module that uses Apple Vision. Image bytes and OCR output are not uploaded or persisted by this phase.
- Cross-origin frames, canvas/image text and PDFs may remain unreadable. The UI reports these limitations rather than guessing.
- Vision-model OCR fallback is intentionally not simulated; it requires the authenticated Edge Function and server integration in Phase 4.

## Target module boundaries

- app/: Expo Router routes and layouts.
- src/browser/: WebView lifecycle, URL handling, tabs and navigation.
- src/extraction/: user-triggered DOM text extraction and sanitization.
- src/ocr/: native Apple Vision bridge and user-selected image OCR.
- src/analysis/: page summary, terms and grounded explanations.
- src/chat/: conversation UI and message contracts.
- src/highlights/: in-app rendering of extracted key passages.
- src/policy/: Assessment Lock and domain policy.
- src/settings/: user preferences and privacy controls.
- src/state/: Zustand stores.
- src/lib/: shared clients, validation and utilities.
- supabase/: migrations and authenticated Edge Functions.
- docs/: architecture and threat model.
- test-fixtures/: local-only extraction/classification test assets.

## Trust boundaries

1. Web content is untrusted input and is never treated as model instructions.
2. Any future WebView-to-native bridge must be read-only, origin-checked and schema-validated.
3. The mobile bundle contains no provider API keys or Supabase service-role credentials.
4. AI requests are routed through authenticated Supabase Edge Functions.
5. Page content is not persisted unless the user explicitly opts in.
6. Assessment Lock is enforced before extraction, OCR or AI analysis begins.

## Platform constraints

- iOS WebView capabilities are not equivalent to unrestricted Safari extension APIs.
- Some pages do not expose complete DOM text (cross-origin frames, canvas, PDFs and image-only content).
- Native Apple Vision integration requires an iOS development build and native module implementation.
- Real-device EAS/Xcode build and runtime verification are required before claiming iPhone compatibility.
