# Egypt section: taxonomy and sources

The Egypt section (`/egypt`) lives in `src/content/egypt.json` and is read by `src/lib/egypt.ts`.

## Structure

region -> variety -> sub-variety. Each node has `id`, `kind` (`arabic` or `language`), `name`, `nameEn`, and optional
`area`, `governorates`, `summary`, `history`, `features`, `sources`, `points` (map pins), `seeAlso`, `family` and
`dialectId`. To add a variety, add a node under `varieties` or `subVarieties`; pages, the map, search and the
breadcrumbs pick it up with no code change.

`dialectId` links a node to a dialect in `phrases.json` / `famous.json`. That dialect's phrases, famous expressions and
audio (`public/audio/<dialectId>/<phraseId>.mp3`, hidden when missing) are reused on the node page, so no content is
duplicated. Existing dialect ids and routes (`/dialects/<id>`) are unchanged; each mapped dialect page links to its
Egypt page. Nodes without their own `dialectId` show the closest ancestor's phrases and say whose they are. Language
nodes (Nubian, Siwi) never show Arabic phrases.

## Classification choices

- Governorates are grouped where their speech differs little (Cairo and Giza; the three Canal cities) and split only
  where the literature describes real differences (east / central / west Delta; north / central / south Upper Egypt;
  North vs Central-South Sinai; the oases vs Awlad Ali Bedouin).
- The existing per-governorate Delta dialects are kept as sub-varieties so their phrases and audio stay reachable.
- Nubian (Kenzi, part of Kenzi-Dongolawi; Nobiin / Fadicca) and Siwi (Berber) are labelled as languages, not Arabic
  dialects.
- Features are limited to well-known, documented points: /q/ as glottal stop vs g; jim as g vs dZ in the south of Upper
  Egypt; Bedouin retention of interdentals; western Delta / Alexandrian n- / n-...-u first person; dilwak in Upper
  Egypt. Where little is documented we say less.
- Map outlines are simplified illustrations, not borders.

## Sources

- Peter Behnstedt & Manfred Woidich, Die aegyptisch-arabischen Dialekte, 5 vols. Wiesbaden: Reichert, 1985-1999.
- Manfred Woidich, Das Kairenisch-Arabische: Eine Grammatik. Wiesbaden: Harrassowitz, 2006.
- Manfred Woidich, "Die Dialekte der aegyptischen Oasen: westliches oder oestliches Arabisch?" ZAL 25 (1993).
- Rudolf de Jong, A Grammar of the Bedouin Dialects of the Northern Sinai Littoral. Leiden: Brill, 2000.
- Rudolf de Jong, A Grammar of the Bedouin Dialects of Central and Southern Sinai. Leiden: Brill, 2011.
- Lameen Souag, Berber and Arabic in Siwa (Egypt). Koeln: Ruediger Koeppe, 2013.
- Marianne Bechhaus-Gerst, The (Hi)story of Nobiin: 1000 Years of Language Change. Frankfurt: Peter Lang, 2011.

## Search

`src/lib/search.ts` builds a client-side index on first use over every phrase variant, transliteration, English
meaning, Standard Arabic, famous phrases (grouped by concept) and Egypt nodes (names and governorates). Text is
normalized: tashkeel and tatweel removed, hamza forms folded to alif / waw / ya, taa marbuta to ha, alif maqsura to ya,
Arabic-Indic digits to Latin.
