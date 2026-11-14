"""Draws the app icons in public/icons from public/favicon.svg. Run: python3 scripts/make-icons.py (needs Playwright)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
svg = (root / 'public/favicon.svg').read_text()
out = root / 'public/icons'
# (file, size, padding as a share of the size, square corners). Maskable icons keep the mark in the safe zone.
icons = [('icon-192.png', 192, 0, False), ('icon-512.png', 512, 0, False), ('maskable-512.png', 512, 0.12, True),
         ('apple-touch-icon.png', 180, 0.06, True)]
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, size, pad, square in icons:
        page = b.new_page(viewport={'width': size, 'height': size})
        body = svg.replace('rx="16"', 'rx="0"') if square else svg
        inner = size * (1 - 2 * pad)
        page.set_content(f'<html><body style="margin:0;background:{"#08302a" if square else "transparent"};display:grid;place-items:center;height:{size}px">'
                         f'<div style="width:{inner}px;height:{inner}px">{body.replace("<svg ", "<svg width=100% height=100% ", 1)}</div></body></html>')
        page.screenshot(path=str(out / name), omit_background=not square)
        page.close()
    b.close()
print('icons in', out)
