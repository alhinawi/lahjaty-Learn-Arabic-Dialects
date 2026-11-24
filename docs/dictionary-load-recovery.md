# Dictionary loading recovery

Failed lazy topic imports previously remained in the in-flight map as rejected promises. Dictionary/global search could stay on Loading indefinitely, with no recovery control.

Settled topic requests now leave the in-flight map, whether successful or failed. Search distinguishes failure from an empty result, explains the download failure in Arabic/English and offers Try again without clearing the query. Successful topic caches are retained. Global search still shows its non-dictionary results. Detail pages keep their prerendered fallback without an unhandled rejection.

183tests/39files, lint/typecheck/content/export5640pass. Tests cover shared in-flight requests, retry after failure, and translated accessible recovery UI.12browser fault-injection flows across dictionary/global search, Arabic/English and320/390/1024px reject the basics chunk, verify query-preserving recovery and a later basics.yes result. Zero hydration errors/overflow. Actual Arabic390 dictionary and English320 global-search error pixels inspected.

Fault injection is a browser fixture, not evidence of a current production outage. No content/audio/source/hosting changes, and no new lexical/native review.
