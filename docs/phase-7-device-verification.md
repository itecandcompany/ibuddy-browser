# Phase 7 — Real-device verification checklist

This phase cannot be marked complete from source inspection alone. Run the following on a physical iPhone using an EAS development build or Xcode build.

## Build and install
- [ ] Configure the dedicated iBuddy Supabase project and local public environment values.
- [ ] Run `npx expo install --fix`, `npm run lint`, `npm run typecheck`, and `npm test -- --runInBand`.
- [ ] Run `npx expo prebuild --clean` on a clean checkout.
- [ ] Build an iOS development client with EAS or Xcode; confirm the local Apple Vision module autolinks and compiles.
- [ ] Install on a physical iPhone and verify launch, safe areas, keyboard and Dynamic Type.

## Browser
- [ ] HTTPS sites load; HTTP, file:, javascript: and unsupported schemes are blocked.
- [ ] Back, forward, reload, search, tabs, bookmarks and history work.
- [ ] Private tabs never add history; closing the tab removes its ephemeral page state.
- [ ] Certificate errors are not bypassed.
- [ ] External links, redirects, downloads, PDFs and popup behavior fail safely.

## Page understanding and OCR
- [ ] Read page is only available after explicit user action and page load.
- [ ] Typed form values, passwords, hidden inputs, cookies and storage never appear in extracted data.
- [ ] Cross-origin frames/canvas/PDF limitations are shown.
- [ ] Assessment Lock blocks DOM extraction, local OCR, server OCR and AI on protected pages.
- [ ] Apple Vision OCR works on user-selected screenshots in airplane mode.
- [ ] Server OCR requires a separate upload confirmation and never stores the image.
- [ ] AI summary and chat require sign-in and fail clearly when server/provider configuration is absent.

## Authentication and privacy
- [ ] Email sign-up, confirmation, sign-in, sign-out and expired-session handling work.
- [ ] Apple sign-in works with the configured Apple Developer capability and Supabase provider.
- [ ] User A cannot read or mutate User B's rows.
- [ ] Manual domain locks sync and are enforced server-side.
- [ ] Account deletion removes Auth user and cascade-linked rows.
- [ ] Network inspection confirms no provider secret in the app bundle and no AI content stored by default.

## Accessibility and resilience
- [ ] VoiceOver labels and focus order are sensible.
- [ ] 44pt minimum touch targets and large text do not clip.
- [ ] Offline, slow network, provider timeout, 401, 403, 413, 429 and 5xx states are understandable.
- [ ] App background/foreground transitions do not break auth refresh or OCR.
