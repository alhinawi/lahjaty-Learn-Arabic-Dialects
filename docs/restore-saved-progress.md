# Restore saved settings and progress before startup writes

The store deliberately skips synchronous hydration to preserve the static server render. Startup now explicitly restores saved state after mount. Badge writes wait for completed restoration, including the first stale effect closure. Account sign-in waits for the same restoration before choosing between existing account progress and the device snapshot. Concurrent restoration requests share one pending promise; later calls do not reapply old local state over current edits.

No storage key, progress schema, account conflict policy, content, audio or hosting change. No automatic reset or recovery of previously overwritten data. The existing account-wins policy is unchanged. Tests cover saved preferences/progress, absent storage, repeated calls and startup order; browser checks cover fresh reload and hydration warnings.
