# Shared phrase context

November 23, 2026.

Shared famous-phrase pages now include the existing explanatory note below the phrase and meaning. The note follows the interface language, with the same Arabic-to-English fallback used on famous cards. Existing source metadata appears through the same collapsed, keyboard-accessible note-only disclosure. This carries the explanation with a shared phrase rather than requiring a second search.

No content is newly researched or rewritten here. The six sourced notes retain their existing twelve links and scope: support for the explanatory note, not pronunciation or example verification. Unsourced notes remain unsourced. Missing notes create no empty section. Everyday share pages are unchanged.

## QA

- 128 tests across 24 files pass, including all six sourced notes in both languages, unsourced notes, missing-note fallback, everyday shares and missing entries.
- Lint, typecheck, content validation and static export pass. Complete prior OG assets reused because image inputs are unchanged.
- 36 browser cases: musakhan, Bethlehem and maqluba, Arabic/English, 320/390/1024, disclosure closed/open, keyboard open/close, safe source links, scoped wording and no horizontal overflow. Everyday share checked separately.
- Actual Arabic390 and English320 open-source phone images and English1024 closed-source desktop image inspected.
- Local build initially exceeded memory with two old preview servers running. Stopping those and bounding Node memory produced a successful build. Two test-harness issues, SSR store snapshot and HTML apostrophe escaping, were corrected without changing app behavior. Keyboard input needed the same Enter text event as previous checks; everyday client link normalizes to a trailing slash.

## Boundaries

No changes to source metadata, examples, translations, entry counts, audio, share URLs, redirect rules, OG images, hosting, accounts or stored favorites. Native/lexical review gaps remain open. Generic crawler metadata of the query-driven share shell remains unchanged.
