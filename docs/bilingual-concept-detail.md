# Bilingual concept detail

November 23, 2026.

Concept detail pages now use existing bilingual fields for their main title, previous/next concept links, region labels, dialect and country names, and explanatory notes. The other-language concept name stays directly below the title. Arabic phrase text, Standard Arabic equivalents, regional words and examples remain in Arabic.

Explanatory notes use the same Arabic-to-English fallback as famous cards. The existing scoped source disclosure is supported if a concept-linked phrase carries it; no current source metadata is added or reassigned.

## QA

- 130 tests across 25 files pass. Language tests cover buddy, how-are-you and now in both interfaces, every variant label/note, Arabic text/examples, and existing share destinations.
- Lint, TypeScript, content check and static export pass. Export 5,644 files. Complete existing OG images reused because their inputs are unchanged.
- 18 local browser cases across three concepts, Arabic/English and 320/390/1024 widths: translated titles/labels, retained Arabic variants and no overflow. Actual English320 overview, English390 variant area and Arabic1024 overview pixels inspected.
- Test assertions account for Next's existing trailing-slash normalization of share links; app destinations were not changed.

## Boundaries

No new translations, lexical claims, explanatory text, sources, examples, entries, audio, share destinations, storage or hosting changes. This displays existing English notes on an English surface, not a new content audit or native-speaker verification. Previously held lexical gaps and note-only citation limits remain.
