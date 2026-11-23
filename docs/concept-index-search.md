# Search within the concept encyclopedia index

November 23, 2026.

The concept index now has a bilingual search input. It uses the existing global matcher for concept names, English, Standard Arabic and stored dialect expressions, then intersects those matches with the selected region filter. It keeps the published concept order and existing distinct dialect counts. The matcher is read without its usual global result limit so other result kinds cannot crowd out matching concepts. No new matching or lexical rules are introduced.

Clear restores the current region's entries; an empty result has a status message. Empty search retains every index card and static link for browsing.

## QA

- 146 tests in 30 files pass: all published concepts in order, non-standard variants only, English/Arabic/normalized dialect queries, all region intersections and empty results.
- Lint, TypeScript, content gate and static export pass, 5,640 files. Complete existing OG assets reused, image inputs unchanged.
- Six browser cases AR/EN320/390/1024. Each checks English, Arabic and diacritized dialect queries, region intersection, clear/full restoration, no-results status and navigation to the concept. No overflow. Actual AR390/EN320 phone pixels inspected.

No content, source, audio, voice policy, counts, matching/ranking algorithm, destinations or hosting changes. Existing lexical review gaps and note-only citation scope remain. A region filter retains its existing meaning of a regional summary word, not proof of complete regional coverage.
