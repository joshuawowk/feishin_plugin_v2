#!/usr/bin/env python3
"""Generate shuffle action icons (two crossing right-pointing arrows)."""
import math
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..",
                   "net.jwowk.feishin.sdPlugin", "imgs", "actions", "shuffle")
os.makedirs(OUT, exist_ok=True)

S = 800
LW = 70            # line width
AH = 150          # arrowhead size


def arrowhead(draw, tip, ang, color):
    back = AH * 0.85
    half = AH * 0.62
    bx = tip[0] - back * math.cos(ang)
    by = tip[1] - back * math.sin(ang)
    p1 = (bx - half * math.sin(ang), by + half * math.cos(ang))
    p2 = (bx + half * math.sin(ang), by - half * math.cos(ang))
    draw.polygon([tip, p1, p2], fill=color)


def polyline(draw, pts, color):
    draw.line(pts, fill=color, width=LW, joint="curve")
    for p in pts:
        draw.ellipse([p[0] - LW / 2, p[1] - LW / 2, p[0] + LW / 2, p[1] + LW / 2],
                     fill=color)


def make(color):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    top, bot = 250, 550
    x0, xk, xt = 150, 330, 600
    a = [(x0, top), (xk, top), (xt - AH * 0.6, bot)]
    b = [(x0, bot), (xk, bot), (xt - AH * 0.6, top)]
    polyline(d, a, color)
    polyline(d, b, color)
    arrowhead(d, (xt, bot), math.atan2(bot - top, xt - xk), color)
    arrowhead(d, (xt, top), math.atan2(top - bot, xt - xk), color)
    return img


variants = {
    "icon": (255, 255, 255, 255),
    "key": (235, 235, 235, 255),
    "key-on": (34, 197, 94, 255),
}

for name, color in variants.items():
    img = make(color)
    img.save(os.path.join(OUT, f"{name}.png"))
    img.save(os.path.join(OUT, f"{name}@2x.png"))
    print("wrote", name)
print("done")
