# Distinct dialect counts for concepts

November 23, 2026.

A concept can have several expressions from one dialect. Its index/detail label must count distinct dialects, not expressions. A shared count helper now excludes Standard Arabic and counts each dialect once. Detail list keys include both dialect and phrase IDs so expressions from the same dialect have separate stable identities.

Ten current concepts had inflated labels. Examples: buddy is 27 dialects/32 expressions, now is 33/34, welcome is 14/19. No expression is removed and no content is rewritten.

## QA

- 133 tests across 26 files pass. Every published concept is checked for its distinct count and full expression/share-link retention; index counts match detail counts. Helper covers empty input, repeats and Standard Arabic exclusion.
- Lint, TypeScript, content check and static export pass. Export 5,644 files. Complete prior OG images reused because their image inputs do not use these labels and are unchanged.
- 18 browser cases cover index/detail counts for buddy, now and welcome in Arabic/English at 320/390/1024, full expression/share target counts, and no overflow. Actual English320, Arabic390 and English1024 pixels inspected.
- The first harness pass did not wait for language hydration after each page load. Corrected the wait and reran all cases; English screenshots now visibly confirm English labels.

## Boundaries and separate follow-up

Counts describe existing entries, not newly verified dialect usage. Existing lexical/native-review gaps and note-only citation limits remain. No content, audio, sources, share destinations, hosting or account changes.

Search and comparison currently map some concept expressions by dialect, which can collapse multiple expressions from one dialect. That is a separate follow-up, not changed by this patch.
