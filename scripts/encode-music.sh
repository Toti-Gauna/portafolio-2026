#!/usr/bin/env bash
# Converts the Suno tracks into the site's background music (public/media/music/pad-<zone>.mp3).
#   scripts/encode-music.sh <dir with pad-inicio.* pad-work.* pad-brand.* pad-roadmap.* pad-about.*> [start_s] [length_s]
# Each file: from `start_s` (default 10, past the intro) for `length_s` (default 70) seconds, loudness −20 LUFS,
# 80 kbps stereo MP3 (~700 KB). The engine (lib/music.ts) loops it by cross-fading two copies, so the cut needs no
# musical loop point. Any input format ffmpeg reads works (mp3, wav, m4a).
set -euo pipefail
SRC="${1:?usage: encode-music.sh <dir> [start_s] [length_s]}"
START="${2:-10}"
LEN="${3:-70}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media/music"
mkdir -p "$OUT"
for zone in inicio work brand roadmap about; do
  f=$(ls "$SRC"/pad-"$zone".* 2>/dev/null | head -1 || true)
  if [ -z "$f" ]; then echo "skip $zone (no file pad-$zone.* in $SRC)"; continue; fi
  ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$f" -vn \
    -af "loudnorm=I=-20:TP=-2:LRA=7,afade=t=in:d=0.03,afade=t=out:st=$(echo "$LEN - 0.03" | bc):d=0.03" \
    -c:a libmp3lame -b:a 80k -ar 44100 -ac 2 "$OUT/pad-$zone.mp3"
  echo "pad-$zone.mp3  $(du -k "$OUT/pad-$zone.mp3" | cut -f1) KB"
done
