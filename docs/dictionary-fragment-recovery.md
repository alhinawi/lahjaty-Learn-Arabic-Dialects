# Dictionary fragment recovery

25 November 2026

## Observed failure

Opening the live basics topic with a truncated percent-encoded URL fragment raised `URI malformed` in the topic page effect. The app error boundary replaced otherwise valid dictionary content with a reload screen.

## Change

Decode optional entry fragments with a guarded helper. Malformed escapes or invalid UTF-8 are ignored. Valid fragments still target the exact entry with `getElementById`; they are not used as CSS selectors and are decoded only once. Missing targets stay harmless. Entry scrolling runs after the app shell route reset, and follows hash/history navigation; pending animation frames and listeners are cleaned up on route change. Local visual inspection caught the previous synchronous anchor scroll being reset to the page top.

No dictionary words, examples, audio, voice selection, account storage, or hosting changes.

## Verification scope

Unit coverage includes plain, encoded, Unicode, empty and malformed fragments. Browser checks cover malformed, missing and valid entry targets, Arabic and English layouts at narrow and desktop widths. Preview and exact-merge production checks are required before closeout. This is URL error recovery, not lexical or native-audio verification.
