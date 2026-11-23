# Playback on concept detail cards

November 23, 2026.

Concept encyclopedia cards previously omitted the playback control available on search, comparison and dialect cards. Each concept expression now passes its own dialect ID, phrase ID and Arabic text to the same existing PlayButton. The text column can shrink and the control keeps its size on narrow screens.

No new audio is added. Existing recording availability and Microsoft Arabic browser-speech capability gates apply unchanged. The button remains absent where neither is available. Browser speech is not native dialect audio and this change does not establish pronunciation quality.

## Checks

- 140 tests across 28 files pass. The new test checks every concept in Arabic and English, including multiple expressions for one dialect: each displayed expression is passed exactly once with its own playback identifiers and text. Missing concepts receive no control.
- Lint, TypeScript, content gate and static export pass: 5,640 files. Complete existing OG assets reused because image inputs are unchanged.
- Twelve browser cases: Arabic/English at 320/390/1024 with and without a simulated Microsoft Arabic voice. Every entry gets a control only with supported speech; first and second expressions dispatch their own Arabic text, stop state toggles, unsupported speech renders no button, no overflow. Simulation checks wiring, not real audio output or pronunciation.
- Actual supported Arabic390 and English320 phone pixels inspected for layout.

No content, sources, entries, counts, translations, audio files, voice policy, route/share destination or hosting changes. Existing lexical review gaps and note-only citation scope remain.
