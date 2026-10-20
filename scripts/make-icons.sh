#!/usr/bin/env bash
# Turn the 800x800 glyph sources in scripts/art/ into the Stream Deck icon set (needs ImageMagick).
#   action icon   20x20 / 40x40   monochrome white on transparent
#   key image     72x72 / 144x144
#   category icon 28x28 / 56x56   monochrome #FFFFFF on transparent
#   plugin icon   256x256 / 512x512
# scripts/make-art.py redraws the shuffle and volume glyphs; the play/pause, next and
# previous glyphs are the original plugin art.
set -euo pipefail
cd "$(dirname "$0")/.."
ART=scripts/art
IMGS=net.jwowk.feishin.sdPlugin/imgs

# emit <src.png> <out-stem> <size> <fit>: trim the glyph, fit it in <fit>px, centre it on a <size>px canvas
emit() {
  convert "$1" -trim +repage -resize "${4}x${4}" -background none -gravity center \
    -extent "${3}x${3}" -strip "PNG32:$2"
}
# action <folder> <icon-art> <key-art> [<key-on-art>]
action() {
  local d="$IMGS/actions/$1"; mkdir -p "$d"
  emit "$ART/$2.png" "$d/icon.png" 20 16;      emit "$ART/$2.png" "$d/icon@2x.png" 40 32
  emit "$ART/$3.png" "$d/key.png" 72 48;       emit "$ART/$3.png" "$d/key@2x.png" 144 96
  if [ -n "${4:-}" ]; then
    emit "$ART/$4.png" "$d/key-on.png" 72 48;  emit "$ART/$4.png" "$d/key-on@2x.png" 144 96
  fi
}

action playpause playpause playpause
action next      next      next
action previous  previous  previous
action transport playpause playpause
action shuffle   shuffle   shuffle shuffle-on
action volumeup  volumeup  volumeup
action volumedown volumedown volumedown
action volumedial volume   volume

mkdir -p "$IMGS/plugin"
# Category icon: white glyph on transparent.
emit "$ART/playpause.png" "$IMGS/plugin/category-icon.png" 28 24
emit "$ART/playpause.png" "$IMGS/plugin/category-icon@2x.png" 56 48
# Plugin icon: green play/pause on a dark rounded tile (no third-party logo).
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
convert -size 512x512 xc:none -fill '#18181b' -draw 'roundrectangle 0,0 511,511 112,112' "$tmp/tile.png"
convert "$ART/playpause.png" -trim +repage -resize 300x300 -fill '#22c55e' -colorize 100 "$tmp/glyph.png"
convert "$tmp/tile.png" "$tmp/glyph.png" -gravity center -composite -strip "PNG32:$IMGS/plugin/marketplace@2x.png"
convert "$IMGS/plugin/marketplace@2x.png" -resize 256x256 -strip "PNG32:$IMGS/plugin/marketplace.png"
