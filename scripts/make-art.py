#!/usr/bin/env python3
"""Draw the 800x800 white-on-transparent glyph sources that are not carried over
from the original plugin: shuffle (plus a green "on" variant) and the three
volume glyphs. Output goes to scripts/art/. Run scripts/make-icons.sh afterwards
to turn every glyph in scripts/art/ into the Stream Deck icon sizes.
"""
import math
import os

from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "art")
S = 800
SS = 2                      # supersample factor
WHITE = (255, 255, 255, 255)
GREEN = (34, 197, 94, 255)  # #22c55e


def canvas():
    img = Image.new("RGBA", (S * SS, S * SS), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def sc(pts):
    return [(x * SS, y * SS) for x, y in pts]


def stroke(d, pts, color, w):
    d.line(sc(pts), fill=color, width=w * SS, joint="curve")
    for x, y in pts:
        r = w * SS / 2
        d.ellipse([x * SS - r, y * SS - r, x * SS + r, y * SS + r], fill=color)


def arrow_to(d, start_pts, tip, color, lw=64, head=170):
    """Polyline from start_pts that ends in an arrowhead whose tip is `tip`."""
    ox, oy = start_pts[-1]
    dx, dy = tip[0] - ox, tip[1] - oy
    n = math.hypot(dx, dy)
    ux, uy = dx / n, dy / n
    base = (tip[0] - ux * head, tip[1] - uy * head)
    stroke(d, start_pts + [base], color, lw)
    px, py = -uy, ux
    half = head * 0.55
    d.polygon(sc([tip, (base[0] + px * half, base[1] + py * half),
                  (base[0] - px * half, base[1] - py * half)]), fill=color)


def shuffle(color):
    img, d = canvas()
    x0, xa, xb, xt, top, bot = 110, 280, 480, 710, 250, 550
    arrow_to(d, [(x0, top), (xa, top), (xb, bot)], (xt, bot), color, head=150)
    arrow_to(d, [(x0, bot), (xa, bot), (xb, top)], (xt, top), color, head=150)
    return img


def speaker(d, color, x=120):
    d.polygon(sc([(x, 310), (x + 150, 310), (x + 330, 160), (x + 330, 640),
                  (x + 150, 490), (x, 490)]), fill=color)


def volume(kind):
    img, d = canvas()
    if kind == "dial":
        speaker(d, WHITE, 140)
        for r, w in ((140, 52), (240, 52)):
            cx, cy = 470 * SS, 400 * SS
            bb = [cx - r * SS, cy - r * SS, cx + r * SS, cy + r * SS]
            d.arc(bb, -45, 45, fill=WHITE, width=w * SS)
    else:
        speaker(d, WHITE, 100)
        stroke(d, [(540, 400), (720, 400)], WHITE, 60)
        if kind == "up":
            stroke(d, [(630, 310), (630, 490)], WHITE, 60)
    return img


def save(img, name):
    img.resize((S, S), Image.LANCZOS).save(os.path.join(OUT, f"{name}.png"))
    print("wrote", name)


os.makedirs(OUT, exist_ok=True)
save(shuffle(WHITE), "shuffle")
save(shuffle(GREEN), "shuffle-on")
save(volume("up"), "volumeup")
save(volume("down"), "volumedown")
save(volume("dial"), "volume")
