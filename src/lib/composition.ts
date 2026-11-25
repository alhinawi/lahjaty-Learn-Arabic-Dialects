/** IME candidate selection owns its keys, not the search suggestion list. */
export function isComposingKey(event: { isComposing?: boolean; keyCode?: number }, composing: boolean): boolean {
  // Some browsers report the confirming key with isComposing=false and legacy code 229.
  return composing || event.isComposing === true || event.keyCode === 229
}
