# Readable search suggestion labels

25 November 2026

The PR199 English320px canonical screenshot exposed a crowded global suggestion: the full Matrouh dialect badge left the matched title almost entirely hidden by ellipsis. Global and comparison suggestions now give the phrase the flexible text column, wrap title/subtitle, align columns at the top and bound the wrapping dialect badge to42% of the row. Existing data and labels are unchanged, with no tooltip-only substitute. Keyboard selection/IME guards remain unchanged.

Require browser checks in both languages at320/390/1024px on global and comparison searches, especially the Matrouh hello/warm greeting result. Verify no clipped text or horizontal overflow, keyboard Enter still selects/navigates, and composing keys remain untouched. Actual pixels before exact-head guarded merge and canonical verification afterward. Structural class tests are not a substitute for layout checks.
