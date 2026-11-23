# iBuddy Browser

An iPhone-first browser built with Expo, React Native and TypeScript, with a privacy-first path toward user-triggered AI page understanding.

## Current implementation

- **Phase 1 — Foundation:** Expo Router, strict TypeScript, shared theme tokens and architecture/threat-model documentation.
- **Phase 2 — Browser shell:** HTTPS-only WebView browsing, URL/search handling, tabs, private tabs, local history and bookmarks, and Assessment Lock domain policy.
- **Phase 3 — Extraction and OCR:** user-triggered visible-page extraction with Zod validation, plus an iOS native Apple Vision module for user-selected images.

Page extraction and OCR are user-triggered and disabled on protected assessment pages. Phase 3 does not generate AI answers or upload page/image content; the server-side vision fallback is deferred to Phase 4.

## Start locally

Install dependencies, then run the app in an Expo development build:

```bash
npm install
npx expo install --fix
npx expo run:ios
```

For an iPhone, use a Mac with Xcode or an EAS development build. Expo Go is not the target runtime.

## Documentation

- `docs/architecture.md`
- `docs/threat-model.md`
- `docs/phase-2-browser-shell.md`

## Verification status

The source files are committed, but package installation, lint, TypeScript, Jest, Android/iOS builds and real-device behavior have not yet been run. Do not treat this repository as release-ready until those checks pass.
