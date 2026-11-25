#!/bin/sh
# Make 800w and 1600w copies of each image for srcset (macOS `sips`).
#   scripts/responsive-images.sh <source> [out-basename] [jpeg|png]
# Writes <out-basename>-800w.<ext> and <out-basename>-1600w.<ext> next to the
# source (skips a size larger than the source). Default format follows the
# source; pass jpeg for opaque photos and screenshots to keep them small.
set -eu
src=$1
dir=$(dirname "$src")
name=$(basename "$src")
base=${2:-${name%.*}}
fmt=${3:-}
ext=${name##*.}
if [ -z "$fmt" ]; then
  case $ext in jpg | jpeg) fmt=jpeg ;; *) fmt=png ;; esac
fi
[ "$fmt" = jpeg ] && out_ext=jpg || out_ext=png
width=$(sips -g pixelWidth "$src" | awk '/pixelWidth/ {print $2}')
for w in 800 1600; do
  out="$dir/$base-${w}w.$out_ext"
  if [ "$width" -gt "$w" ]; then
    sips -s format "$fmt" -s formatOptions 82 --resampleWidth "$w" "$src" --out "$out" >/dev/null
  else
    sips -s format "$fmt" -s formatOptions 82 "$src" --out "$out" >/dev/null
  fi
  echo "$out $(sips -g pixelWidth -g pixelHeight "$out" | awk '/pixel/ {printf "%s ", $2}')"
done
