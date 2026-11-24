# Install startup

PWA setup now registers the existing service worker immediately when the document is already complete, or once at load otherwise. Repeated setup calls cannot duplicate event listeners or registration. Install controls use a hydration-safe external snapshot, with the same empty first render as static HTML. Browser install events and display-mode changes update it. A rejected install prompt returns false without an unhandled rejection.

178tests/37files pass, including load ordering, repeated setup, development exclusion and server snapshots for iPhone/standalone clients. Lint/typecheck/content/export pass,5640files.18browser fixtures cover iPhone hints, standalone and rejected prompts across AR/EN320/390/1024, zero hydration errors/overflow. These simulate browser capability signals, not actual OS installation. Actual Arabic390px hint and English320px installed-state pixels inspected.

No service-worker caching policy, content, audio or hosting changes. Existing lexical/native-review caveats remain.
