# Keyboard selection in global search

November 23, 2026.

Home and results-page search now use the existing picker cursor helper for ArrowDown/ArrowUp selection with wrapping. Enter chooses an active suggestion; plain Enter still searches the typed query. Escape dismisses the list and clears the cursor. Typing, clearing and focus reset the cursor. Input focus stays in the combobox, stable option IDs and aria-activedescendant identify the active result, and its visible border/background tracks the cursor. The explicit all-results action always searches the typed query even when a suggestion is active; click selection remains.

## QA

- Existing 146 tests/30 files pass, including shared picker cursor coverage.
- Lint, TypeScript, content gate and static export pass, 5,640 files. Complete existing OG assets reused because image inputs are unchanged.
- Twelve browser cases: home/results-page search, Arabic/English, 320/390/1024. Real keys check up-to-last/wrap, second-result Enter, plain typed-query Enter, Escape/reopen, all-results action while a suggestion is active, click selection, focus/active-option binding and no overflow. Actual home Arabic390 and results English320 pixels inspected.

No matching/ranking, content, audio, voice policy, sources, counts, destinations or hosting changes. Existing lexical review gaps and note-only citation scope remain. Keyboard/markup checks do not certify screen-reader usability.
