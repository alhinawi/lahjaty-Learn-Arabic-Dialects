# Phrase sharing recovery

The share button previously swallowed all errors as if the visitor cancelled. Native-share failures now try copying the same canonical phrase link. A cancelled sheet stays quiet. If native sharing and clipboard are unavailable or fail, the visitor gets a translated, read-only selectable link. Busy state prevents repeated clicks during an attempt. No messages are sent automatically and destinations remain unchanged.

191tests/42files, lint/typecheck/content/export5639pass. Unit tests cover native success, cancellation, fallback copy and manual recovery.24AR/EN320/390/1024 browser capability fixtures cover the same four paths, exact title/text/URL, copied feedback and click-to-select manual input. Zero hydration errors/overflow. Actual Arabic390/English320 manual-state pixels inspected. This tests browser API handling, not a real OS share sheet or clipboard/device delivery.

No content, recordings, source or hosting changes. Existing lexical/native-review gaps remain.
