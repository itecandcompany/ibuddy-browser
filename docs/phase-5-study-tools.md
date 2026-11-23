# Phase 5 — Question-aware study tools

- Added local question-intent classification for definitions, comparisons, procedures, calculations, concepts and assessment-like wording.
- Assessment-like wording is routed to concept/method teaching rather than direct answer generation.
- Added local key-term extraction from the already user-read page snapshot.
- Highlights are rendered inside iBuddy only; no DOM overlays, page modification, answer injection or auto-fill.
- AI responses remain grounded in the extracted page snapshot, with uncertainty disclosed.
- These heuristics are guardrails, not a reliable detector of every graded activity. Assessment Lock remains the authoritative feature and should be used for any graded/proctored page.
