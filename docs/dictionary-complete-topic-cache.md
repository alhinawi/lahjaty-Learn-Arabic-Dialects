# Dictionary detail pages keep topic caches complete

A prerendered word detail passed its one initial entry to useTopic, which treated that array as a complete topic and seeded the shared cache. Later search/topic navigation in that session could then miss other words from the same topic.

The detail hook now uses its initial entry only as a matching-ID display fallback while the full topic loads. Only full topic arrays seed the topic cache. No content or loading-source changes.

181tests/38files, lint/typecheck/content/export pass,5640files. Regressions verify the initial detail stays visible, both fixture entries reach the complete cache, full initial topics still skip loads, and mismatched initial IDs are not displayed. Six browser flows across AR/EN320/390/1024 open basics.yes directly, find basics.no in search, open it, then verify14topic cards. Zero hydration errors/overflow. Actual Arabic390px and English320px same-topic search results inspected.

No content/audio/source/hosting changes or new linguistic verification. Existing lexical/native-review caveats remain.
