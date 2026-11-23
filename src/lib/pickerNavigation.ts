/** Wrap a keyboard cursor through the current result list. -1 means no cursor. */
export function movePickerIndex(current: number, direction: 1 | -1, length: number): number {
  if (length <= 0) return -1
  if (current < 0 || current >= length) return direction === 1 ? 0 : length - 1
  return (current + direction + length) % length
}
