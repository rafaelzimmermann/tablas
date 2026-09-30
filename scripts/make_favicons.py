#!/usr/bin/env python3
"""Generate the Tablas favicon set from the production brandmark.

Mirrors the header mark in src/ui/App.js + style.css (.brandmark): a blue
tile tilted -7deg carrying a lowercase t with a small x at its lower-right
corner. The letterforms are drawn as round-capped bars so the vector and
raster outputs stay identical everywhere, with no font dependency.

Outputs at the project root:
  favicon.svg           vector icon for modern browsers
  favicon.ico           multi-size (16/32/48) fallback
  apple-touch-icon.png  180x180 iOS home-screen icon
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

BLUE = (36, 91, 204, 255)     # --primary #245BCC
PAPER = (244, 248, 252, 255)  # --background #F4F8FC
WHITE = (255, 255, 255, 255)  # --surface

VIEWBOX = 64
TILE = 56        # tile side inside the viewBox, leaves room for the tilt
RADIUS = 15.5    # 12px on the 43px production tile (~28%)
TILT = 7         # -7deg in production CSS


def glyph_lines():
    """Round-capped bars spelling the t-x mark, in tile coordinates."""
    t_stroke = 7.3  # t stem and crossbar
    x_stroke = 5.6  # small corner x
    return [
        ((28, 11.8), (28, 44.2), t_stroke),    # t stem
        ((16.4, 21), (39.6, 21), t_stroke),    # t crossbar
        ((34.2, 34.2), (48.6, 48.6), x_stroke),
        ((48.6, 34.2), (34.2, 48.6), x_stroke),
    ]


def svg():
    lines = "\n".join(
        f'      <line x1="{x1:g}" y1="{y1:g}" x2="{x2:g}" y2="{y2:g}"'
        f' stroke-width="{w:g}"/>'
        for (x1, y1), (x2, y2), w in glyph_lines()
    )
    offset = (VIEWBOX - TILE) // 2
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <g transform="rotate(-{TILT} 32 32) translate({offset} {offset})">
    <rect width="{TILE}" height="{TILE}" rx="{RADIUS:g}" fill="#245BCC"/>
    <g stroke="#FFFFFF" stroke-linecap="round">
{lines}
    </g>
  </g>
</svg>
"""


def draw_tile(px):
    """The tilted brand tile as an RGBA image, transparent outside it."""
    scale = px / TILE
    tile = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    d.rounded_rectangle([0, 0, px - 1, px - 1], radius=RADIUS * scale, fill=BLUE)
    for (x1, y1), (x2, y2), w in glyph_lines():
        p1, p2 = (x1 * scale, y1 * scale), (x2 * scale, y2 * scale)
        r = w * scale / 2
        d.line([*p1, *p2], fill=WHITE, width=round(w * scale))
        for x, y in (p1, p2):  # round caps
            d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)
    return tile.rotate(TILT, resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))


def draw_icon(size, background=None, tile_ratio=1.0):
    ss = 8  # supersample for smooth edges
    s = size * ss
    canvas = Image.new("RGBA", (s, s), background or (0, 0, 0, 0))
    tile_px = round(s * tile_ratio * TILE / VIEWBOX)
    canvas.alpha_composite(draw_tile(tile_px), ((s - tile_px) // 2,) * 2)
    return canvas.resize((size, size), Image.LANCZOS)


def main():
    (ROOT / "favicon.svg").write_text(svg() + "\n")

    # iOS applies its own corner mask; give it an opaque square with the
    # tilted tile sitting on the app's paper background.
    draw_icon(180, background=PAPER, tile_ratio=0.8).save(
        ROOT / "apple-touch-icon.png"
    )

    draw_icon(256).save(
        ROOT / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("Generated favicon.svg, favicon.ico, apple-touch-icon.png in", ROOT)


if __name__ == "__main__":
    main()
