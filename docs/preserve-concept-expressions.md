# Keep every expression in search and comparison

November 23, 2026.

Several expressions can belong to the same concept and dialect. Search previously built a dialect-to-single-row map, repeating the last expression where several rows existed. Comparison kept only the last expression. Both now group rows into arrays by dialect and render every expression once, in original within-dialect order.

Search moves all of the visitor's own-dialect rows together to the highlighted first group. Exact-entry links, phrase text and audio IDs remain paired with their original expression. Compound dialect+phrase keys avoid collisions. Standard Arabic behavior is preserved, not reclassified by this patch.

## QA

- 136 tests across 27 files pass. Every concept is rendered through search and comparison with every expression's own audio ID checked exactly once. Search checks each exact-entry destination with and without a selected own dialect. Grouping preserves order; empty input is supported.
- Lint, TypeScript, content check and static export pass. Export 5,644 files. Complete prior OG assets reused because image inputs are unchanged.
- 24 browser cases: buddy and welcome in search/comparison, Arabic/English, 320/390/1024. Every existing expression and search target checked; no overflow. Actual English320 comparison and Arabic390 search pixels inspected, visibly showing multiple expressions from the same dialect.
- Browser wait initially looked for a buddy-only expression on a welcome page; corrected the harness selector and reran all cases. No app change was needed.

## Boundaries

No new expressions, translations, lexical claims, counts, source metadata, audio files/voices, share destinations, storage or hosting changes. This exposes existing content correctly, not a new lexical audit. Held review gaps and note-only citation scope remain unchanged.
