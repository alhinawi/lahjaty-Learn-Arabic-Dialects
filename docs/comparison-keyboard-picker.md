# Keyboard selection in comparison search

November 23, 2026.

The comparison search already exposed a combobox/listbox, but arrow keys did not select results and Escape did not dismiss suggestions. It now keeps a keyboard cursor: down starts at the first option, up at the last, and repeated arrows wrap. Enter chooses the active option, retaining the previous best-hit behavior when no option is active. Escape dismisses the list and clears the cursor. Typing or clearing resets the cursor.

Each option has a stable per-picker ID. The input exposes the active option through aria-activedescendant while keeping input focus; the active option has a visible background/border and scrolls into view. Mouse/touch selection stays available.

## QA

- 143 tests across 29 files pass, including cursor start, movement, wrap, empty/single result and stale cursor after list shortening.
- Lint, TypeScript, content gate and static export pass: 5,640 files. Existing complete OG assets reused, image inputs unchanged.
- Twelve browser cases: everyday/concept search, Arabic/English, 320/390/1024. Real key events check up-to-last, wrap, second-option Enter, focus retention and active-option binding, Escape, reopening and click selection. No overflow. Actual Arabic390 concept and English320 everyday pixels inspected.

No matching/ranking, content, audio, voice policy, sources, counts, routes, share destinations or hosting changes. Existing lexical review gaps and note-only citation scope remain. Browser checks establish keyboard behavior and markup, not a screen-reader usability certification.
