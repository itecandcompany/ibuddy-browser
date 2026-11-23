# iBuddy Browser

An iPhone-first browser built with Expo, React Native and TypeScript, with privacy-first, user-triggered page understanding.

## Implemented in source

- **Phase 1 — Foundation:** Expo Router, strict TypeScript, theme tokens, architecture and threat model.
- **Phase 2 — Browser shell:** HTTPS-only WebView, address/search, tabs, private tabs, local history/bookmarks and Assessment Lock.
- **Phase 3 — Extraction and OCR:** user-triggered visible-page extraction, strict Zod validation and native Apple Vision OCR for user-selected images.
- **Phase 4 — AI backend:** authenticated Supabase Edge Functions for page summaries, grounded chat, opt-in server vision OCR and confirmed account deletion; rate limiting and server-side lock checks.
- **Phase 5 — Study tools:** question-intent classification, concept-only behavior for assessment-like wording and in-app key-term highlights.
- **Phase 6 — Auth and privacy:** SecureStore-backed Supabase sessions, email/password and Apple sign-in, RLS migrations, account settings and server-side account deletion.
- **Phase 7 — Device verification:** EAS profiles, CI workflow and physical-iPhone verification checklist.
- **Phase 8 — Security and release:** security audit notes, release blockers and App Store preparation checklist.

## Start locally

1. Copy `.env.example` to `.env` and configure the public Supabase URL and publishable/anon key.
2. Install dependencies and align Expo package versions:

```bash
npm install
npx expo install --fix
```

3. Start the development client:

```bash
npx expo start --dev-client
```

For a native iPhone build, use EAS Build or a Mac with Xcode. Expo Go is not the target runtime.

## Supabase setup

Read [Phase 4 backend setup](docs/phase-4-ai-backend.md). Apply migrations in order, set AI provider secrets in Supabase Edge Function secrets, and deploy functions with JWT verification enabled. Do not put AI provider keys or service-role credentials in the mobile app.

## Documentation

- `docs/architecture.md`
- `docs/threat-model.md`
- `docs/phase-2-browser-shell.md`
- `docs/phase-3-extraction-ocr.md`
- `docs/phase-4-ai-backend.md`
- `docs/phase-5-study-tools.md`
- `docs/phase-6-auth-and-privacy.md`
- `docs/phase-7-device-verification.md`
- `docs/phase-8-security-and-release.md`

## Verification status

All eight phases now have implementation source or checklists committed. **This is not yet a verified production release.** No dedicated iBuddy Supabase project has been selected, migrations and Edge Functions have not been deployed, provider secrets are not configured, and a native iPhone build has not been run. The CI workflow is committed; its first run must pass before release readiness can be assessed.
