/** Small helpers shared by the page writer and the card renderer, with no native dependencies. */
export const W = 1200
export const H = 630
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
