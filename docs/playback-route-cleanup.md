# Stop playback when leaving a page

Shared speech and audio players previously had no route-change cleanup. Leaving a word or phrase page could keep its playback running on another page.

The app shell now installs pathname-bound cleanup for both players and unmounts. Initial mounting does not cancel playback. Voice eligibility, provider selection and speech rate remain unchanged.

185tests/40files lint/typecheck/content/export5639pass. Unit tests verify cleanup calls both players for page changes/unmounts. Six Arabic/English320/390/1024 browser fixtures start simulated speech on a shared phrase, navigate through a real client link, and verify cancellation with the document marker preserved. Zero hydration errors/overflow. Actual destination pixels inspected. Browser fixture checks wiring, not real device sound or pronunciation. No recorded clips or native voices added.

No content/source/hosting changes. Existing lexical/native-review gaps remain. Source comments are not authority for voice policy; this change preserves current selection without making or resolving that separate claim.
