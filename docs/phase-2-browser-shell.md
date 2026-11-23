# Phase 2 — Browser shell

## Implemented in this phase

- React Native WebView browser surface with address/search input, navigation controls, loading progress and error states.
- HTTPS-only navigation policy. HTTP and unsupported URL schemes are blocked; the browser does not silently upgrade insecure URLs.
- Multiple regular/private tabs. Private-tab visits are excluded from the browser history.
- Local-first browsing history and bookmarks persisted with AsyncStorage.
- User-managed domain locks and automatic Assessment Lock for Google Forms pages and selected known proctoring domains.
- Assessment Lock banner; no page extraction, OCR or AI analysis is present in this phase.
- URL parsing and Assessment Lock unit-test files.

## Security boundaries

- Web content is rendered in WebView and remains untrusted.
- No injected JavaScript bridge or page extraction is introduced in Phase 2.
- Only HTTPS top-level navigations are allowed by the navigation callback.
- TLS/certificate errors are not bypassed. The WebView reports load failures to the app.
- Private tabs do not add entries to the persisted history. This phase does not claim private-mode network anonymity or prevent websites from tracking a session.

## Known limitations / verification still required

- iOS WKWebView certificate validation is platform-managed; this app does not expose a certificate-error bypass. Real-device testing is required to verify user-visible failure behavior for invalid certificates.
- The current tab switcher is a compact native list/alert, not a full visual tab-grid screen. Switching tabs reloads the saved URL and does not preserve each page's in-memory form or scroll state.
- History and bookmarks are persisted locally; cloud sync and account-linked retention controls belong to later phases.
- Android and iOS builds, package installation, lint, TypeScript and Jest have not been run in this remote commit workflow.
- Cross-platform pull-to-refresh behavior needs device testing. Android uses WebView pull-to-refresh; iOS users can use Reload.
- Automatic domain rules are conservative defaults and may need review before release.
