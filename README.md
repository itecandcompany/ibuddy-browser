# iBuddy Browser

An iPhone-first browser built with Expo, React Native and TypeScript, with a privacy-first path toward user-triggered AI page understanding.

## Current implementation

- **Phase 1 — Foundation:** Expo Router, strict TypeScript, shared theme tokens and architecture/threat-model documentation.
- **Phase 2 — Browser shell:** HTTPS-only WebView browsing, URL/search handling, tabs, private tabs, local history and bookmarks, and Assessment Lock domain policy.

Phase 2 deliberately contains **no page extraction, OCR, AI answers or injected page bridge**. Those belong to later phases and must remain disabled on protected assessment pages.

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
