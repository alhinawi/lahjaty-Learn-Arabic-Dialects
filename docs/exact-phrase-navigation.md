# Exact phrase navigation from search

November 22, 2026.

Search result phrase links now use the stable entry ID to open the matching famous card on its dialect page, rather than making the reader search the page again. Concept-result dialect variants use the same target. The separate dialect-name link still opens the dialect overview. Everyday-phrase comparison links and dictionary links are unchanged.

Published dialect cards have stable fragment IDs, header-safe scroll spacing, a visible target border and a programmatic focus target. The page handles direct fragments, client navigation and history changes, ignoring malformed or unknown fragments. Changing the interface language realigns a selected card after text reflow. No animation is required and no content is rewritten. The optional anchor is assigned only on dialect pages, not on cards reused in favorites or other surfaces, avoiding duplicate IDs there.

## QA

- 123 tests across 23 files pass, including stable/unique URL generation and card-target markup tests.
- Lint, TypeScript, content validation and Next static export pass. Export stays at 5,644 files. Existing complete OG images reused because no image input changed.
- Static output checked for exactly one target for all 915 entries on 44 published dialect pages. Standard Arabic's 21 entries have no dialect-detail route, as before; they are not part of this published-target count.
- 12 browser cases across Arabic/English and 320/390/1024 widths: keyboard activation from a real musakhan search result, exact card landing, visible target, header clearance, back/forward navigation and direct Bethlehem fragment load. No horizontal overflow. Actual phone and desktop pixels inspected.
- Initial client-navigation fragment handling did not scroll after the route changed. A bounded post-render fragment handler fixed it. Initial language reflow could move the card; realigning on interface-language changes fixed that. Both were rebuilt and rechecked.

## Boundaries

No content, source, lexical validation, example, translation, count, audio, favorite storage, share destination, hosting or account changes. Existing source scope and native/lexical-review caveats remain. The full-page route and existing share URLs are preserved. Invalid fragments do not turn a valid dialect page into a 404.
