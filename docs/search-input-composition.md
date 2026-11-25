# Search input composition

25 November 2026

Reproduced on canonical before this change: dispatching a composing ArrowDown keyboard event in global search, comparison and dictionary prevents the event and selects a search suggestion. These keys belong to the input method's candidate selection until composition finishes.

Guard picker key handlers using native isComposing, composition start/end state and legacy keyCode229 confirmation events. Keep composition state local to each input, clear it on blur, and guard form submissions while composition is active. No changes to matching, result order, query storage or content. Ordinary ArrowDown/ArrowUp/Escape/Enter must work again after composition ends.

Verification: helper tests plus browser checks for all three inputs in Arabic/English at320/390/1024px. Exercise composition-start state, native composing events, legacy229 events, form submission while composing, and normal keyboard selection after composition ends. Browser-dispatched composition events are regression simulations, not a claim to have tested every OS input method. Require exact-head Pages checks and actual pixels before guarded normal merge; verify exact-merge production and canonical afterward.
