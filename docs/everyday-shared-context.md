# Preserve everyday usage context on shares

November 23, 2026.

Everyday phrase share pages now retain the existing usage note shown on the full phrase card. This includes context such as masculine address, which was previously lost on a shared link. The shared context section uses the same Arabic-to-English fallback as the phrase card. Famous-entry notes and their optional note-only sources remain unchanged; everyday notes do not inherit those citations. Empty notes produce no section.

## QA

- 148 tests in 30 files pass. All existing everyday notes checked in Arabic and English, plus fallback/empty section, unchanged comparison link and famous-entry citation boundaries.
- Lint, TypeScript, content gate and static export pass, 5,640 files. Existing complete OG assets reused, image inputs unchanged.
- Twelve browser cases: two everyday phrases at Arabic/English320/390/1024, exact existing note retained, no borrowed citations, comparison link present and no overflow. Actual greeting Arabic390/name English320 phone pixels inspected.

No new note wording, facts, sources, translations, audio, voice policy, counts, share destinations or hosting changes. Existing lexical review gaps and note-only citation scope remain. Showing a stored note does not newly verify its factual accuracy. Generic crawler share metadata is unchanged.
