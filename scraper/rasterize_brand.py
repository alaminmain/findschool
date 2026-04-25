"""Rasterize the brand SVGs into every PNG size that Expo + Play Store want.
Uses headless Chromium (already installed for the IPEMIS recon) so we don't
need cairo / rsvg / ImageMagick on Windows.
"""

import sys, io, base64
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "mobile" / "assets" / "brand"
ASSETS = ROOT / "mobile" / "assets"
STORE = ROOT / "mobile" / "store"

# (svg, output_path, width, height, bg)
JOBS: list[tuple[Path, Path, int, int, str | None]] = [
    (BRAND / "icon.svg",                ASSETS / "icon.png",                1024, 1024, None),
    (BRAND / "adaptive-foreground.svg", ASSETS / "adaptive-icon.png",       1024, 1024, None),
    (BRAND / "splash.svg",              ASSETS / "splash.png",              1242, 2688, "#0E7C3A"),
    (BRAND / "icon.svg",                ASSETS / "favicon.png",               48,   48, None),
    (BRAND / "icon.svg",                STORE  / "play-icon.png",            512,  512, None),
    # Feature graphic: 1024x500 - center the icon on a brand-green band.
    (BRAND / "icon.svg",                STORE  / "feature-graphic.png",     1024,  500, "#0E7C3A"),
]


def render_html(svg_text: str, w: int, h: int, bg: str | None) -> str:
    bg_rule = f"background:{bg};" if bg else "background:transparent;"
    # For feature-graphic we want the icon inset, not stretched.
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body {{ margin:0; padding:0; width:{w}px; height:{h}px; {bg_rule} }}
  .frame   {{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; }}
  svg      {{ max-width:80%; max-height:80%; }}
</style></head><body><div class="frame">{svg_text}</div></body></html>"""


def render_full(svg_text: str, w: int, h: int, bg: str | None) -> str:
    """For non-feature-graphic outputs we want the SVG to fill the canvas."""
    bg_rule = f"background:{bg};" if bg else "background:transparent;"
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body {{ margin:0; padding:0; width:{w}px; height:{h}px; {bg_rule} }}
  svg      {{ width:{w}px; height:{h}px; display:block; }}
</style></head><body>{svg_text}</body></html>"""


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for src, dst, w, h, bg in JOBS:
            svg_text = src.read_text(encoding="utf-8")
            ctx = browser.new_context(viewport={"width": w, "height": h},
                                      device_scale_factor=1)
            page = ctx.new_page()
            html = (render_html if "feature-graphic" in dst.name else render_full)(
                svg_text, w, h, bg
            )
            page.set_content(html)
            dst.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(dst), type="png", omit_background=(bg is None))
            ctx.close()
            print(f"  {src.name:32}  ->  {dst.relative_to(ROOT)}  ({w}x{h})")
        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
