# Flashcards use restored review dates

## Reproduced

The flashcard session memo ran before AppShell restored local progress. A direct load with Cairo selected, the first phrase due in2099 and the second overdue showed the future-due first phrase. Because the selected dialect was still Cairo, hydration did not change the memo dependency, leaving the default session fixed.

## Fix

A hydration gate shows existing skeletons until saved progress is ready, then mounts the session. The session stays fixed while answers update saved review dates. Keying it by dialect also resets flip/index/count state when the selected dialect changes. No storage format, review interval, account-wins policy or content change.

## Validation

-164 tests across35 files, including waiting before hydration, overdue-first in either language, and all-future empty sessions.
- Lint, typecheck, content validation, static export pass;5640 files after full unchanged OG assets restored for local QA.
-18 browser cases: Arabic/English at320,390,1024; overdue-first, all-future, fresh sessions. Answer advances and persists, reload excludes answered card. Zero hydration errors.
- Actual overdue Arabic390px and all-future English320px screenshots inspected. Router payload check passes.

This fixes session initialization, not lexical accuracy. Existing lexical/native-review caveats remain; no new audio or verified-native claims.
