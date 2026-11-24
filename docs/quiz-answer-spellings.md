# Quiz answer spelling ambiguity

## Reproduced

Across100 deterministic match rounds,28 wrong-answer pairs differed only by optional Arabic marks, alef form or punctuation, rather than clearly different words. Examples in the stored corpus include shadda-only variants of the same resignation sentence and the same expression for being right.

## Change

Both dialect quiz builders now use a conservative written-text key: Unicode compatibility normalization, removal of Arabic annotation marks and tatweel, alef folding, punctuation/symbol removal and whitespace folding. Match distractors with the same key are excluded. Guess-quiz ownership exclusions use the same key across the existing everyday/famous corpus. Distinct consonants remain distinct. Stored content and display spelling are unchanged.

This prevents avoidable grading ambiguity. It does not prove a phrase belongs to only one dialect outside this corpus. Dialect/geographic accuracy and native review remain open, as recorded in existing audit ledgers. No new forms, examples or audio were added.

## Checks

-168 tests/35files, lint/typecheck/content validation/static export;5640files.
-100 deterministic match rounds have no normalized-identical wrong answers.
-100 guess rounds retain10questions, each with only one corpus owner under the same key.
- Fixture tests cover all-identical pools and different consonants.
-12 browser cases: both dialect quiz modes, AR/EN at320/390/1024;120questions completed, scores persisted, zero hydration errors and no horizontal overflow.
- Actual Arabic390px and English320px feedback screens inspected.
