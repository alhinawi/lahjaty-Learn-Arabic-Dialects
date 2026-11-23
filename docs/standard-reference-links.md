# Working Standard Arabic reference links

November 23, 2026.

Concept search results include Standard Arabic references, but the static site deliberately exports no Standard Arabic dialect-detail route. Their former /dialects/fs/ links therefore had no destination. The shared famous-entry link helper now routes Standard Arabic to the existing query-driven share shell; actual dialects keep their exact-entry fragments. The dialect-label link uses the same working reference destination for Standard Arabic only.

The reference share page no longer offers a nonexistent Standard Arabic dialect overview. Its comparison link remains. Existing dialect share pages and share-button destinations stay unchanged.

## QA

- 138 tests across 27 files pass: every Standard Arabic famous entry gets a valid query-shell URL; every concept search result retains its audio ID and the appropriate destination; Standard Arabic shares have no broken overview link while ordinary dialect shares keep theirs.
- Lint, TypeScript, content check and static export pass, 5,644 files. Existing complete OG assets reused because image inputs are unchanged.
- Six browser cases: keyboard navigation from a real now search result, Arabic/English at 320/390/1024, correct reference phrase, comparison link, no broken overview link and no overflow. Actual Arabic390 and English320 phone pixels inspected.

## Boundaries

No new content, translations, source metadata, lexical verification, entries, audio, share-button URLs, redirects, exported routes, hosting or account changes. Standard Arabic remains a reference, not counted as a dialect. Existing note-only source scope and lexical-review gaps remain.
