# Reader-visible context-note sources

Reviewed November 22, 2026. Adds optional citations to four existing rural Palestinian context notes. This is partial source coverage, not verification of all 936 famous entries.

## Scope and source mapping

Each disclosure is titled "Sources for this note" in the selected interface language and states that the sources support the note only, not pronunciation or example verification. It is collapsed by default and uses native details/summary keyboard behavior. No whole-entry verified badge is added.

- `famous.maqluba`: Serious Eats, Reem Kassis recipe (updated July 21, 2022), for layered rice/vegetables, optional meat and inverted serving; Bethlehem Cultural Festival cooking account, for preparation context.
- `famous.khubz_taboon`: Serious Eats, Reem Kassis recipe (updated February 20, 2025), for traditional baking on hot stones and resulting dimples; Bethlehem University (February 27, 2020), for the traditional clay oven and stones. The university account draws on an ethnographic book rather than being wholly independent field evidence.
- `famous.al_khalil`: UNESCO World Heritage description for the Old Town around the Ibrahimi sanctuary and Mamluk/Ottoman architecture; Hebron Rehabilitation Committee for glass and ceramic craft context. No common origin date is assigned to these crafts.
- `famous.bethlehem`: UNESCO World Heritage description and ICOMOS Palestine for the first church completed in 339 and sixth-century replacement retaining earlier parts. The latter may depend on UNESCO rather than providing independent confirmation. The prior audit records BBC's conflicting 399 date and why the heritage sources were used.

All eight destination pages were fetched and their relevant passages read on November 22, 2026. Pages without a visible date remain undated. The bilingual display labels are descriptive labels, not purported exact page titles. Sources remain external publisher pages, not copied articles.

## Implementation

Optional `noteSources` metadata requires nonempty bilingual notes and source labels, HTTPS destinations without credentials, and no duplicate canonical URL per note. Invalid runtime links are omitted. Links open a new tab with noopener/noreferrer and a screen-reader warning. The summary target is at least 44 pixels high.

The reusable disclosure is included in famous cards and the daily phrase's note. Share pages do not render notes. These four entries currently have no concept mapping, so concept pages are unchanged.

## QA

- 118 tests across 21 files, including 10 tests for metadata, URL rules, scope text, collapsed rendering and surface wiring.
- ESLint, TypeScript and content validation pass.
- Static export passes at 5,644 files, under the 15,000-file safety budget. Existing complete OG images were reused because image contents did not change; no full image render was needed.
- 48 browser cases: four cards, Arabic/English, 320/390/1024-pixel widths, collapsed/expanded states. Checked Enter opens/closes, retained summary focus, 44-pixel targets, scope wording, exactly two links per sourced card, safe new-tab attributes and no horizontal overflow.
- Inspected actual phone screenshots for every card in both languages, plus narrow, collapsed and desktop representatives. Initial focus-outline overlap was fixed with spacing and rounded focus treatment, rebuilt and rechecked.
- Exact data comparison against the base confirms only eight source objects added across four entries. No headwords, translations, context notes, examples, dialect placement, counts or audio changed.

## Limits

This does not establish native-speaker or lexical validation. Existing Palestinian and Sharqia lexical-review gaps remain. No audio, expansion, outreach, spending, attribution claim or hosting change.

## Sources

- https://www.seriouseats.com/maqlubeh-recipe-5704126
- https://www.bethlehemculturalfestival.com/event-archive/cooking-in-bethlehem-and-gaza/
- https://www.seriouseats.com/taboon-recipe-5219608
- https://www.bethlehem.edu/2020/02/27/traditional-palestinian-tabun-oven/
- https://whc.unesco.org/en/list/1565
- https://hebronrc.ps/en/node/25
- https://whc.unesco.org/en/list/1433/
- https://palestine.icomos.org/sites/birthplace-of-jesus-church-of-the-nativity-and-the-pilgrimage-route-bethlehem/

Related audits: `2026-11-22-palestinian-food.md` and `2026-11-22-hebron-bethlehem.md`.
