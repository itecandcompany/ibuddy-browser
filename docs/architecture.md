# iBuddy Browser — Architecture

## Product boundary

iBuddy is an iPhone-first browser with user-triggered page understanding. It only analyzes content the user deliberately submits and is not designed to monitor other apps or evade website or assessment restrictions.

## Phase 1 foundation

- Expo SDK 54 / React Native 0.81 baseline.
- Expo Router file-based navigation.
- TypeScript strict mode and @/* path alias.
- Shared design tokens in src/theme.
- Development-build workflow; Expo Go is not the target runtime.
- Browser, extraction, OCR, analysis, chat, highlights, settings and policy modules are introduced in later phases.

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
2. The WebView-to-native bridge is read-only, origin-checked and schema-validated.
3. The mobile bundle contains no provider API keys or Supabase service-role credentials.
4. AI requests are routed through authenticated Supabase Edge Functions.
5. Page content is not persisted unless the user explicitly opts in.
6. Assessment Lock is enforced before extraction, OCR or AI analysis begins.

## Phase 2 browser design

The browser shell will use react-native-webview with an explicit navigation policy. Only HTTPS navigation is permitted. Plain HTTP receives an in-app warning. TLS/certificate failures are not bypassed. Tabs are isolated browser instances; private tabs do not write history. History and bookmarks are local-first until the Supabase persistence phase.

## Platform constraints

- iOS WebView capabilities are not equivalent to unrestricted Safari extension APIs.
- Some pages do not expose complete DOM text (cross-origin frames, canvas, PDFs and image-only content).
- Native Apple Vision integration requires an iOS development build and native module implementation.
- Real-device EAS/Xcode build and runtime verification are required before claiming iPhone compatibility.
