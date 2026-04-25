# Brand Assets — Rasterization Guide

SVG sources live here. Expo and the Play Console need rasterized PNGs.
Run the one-liner below (requires `librsvg` / `rsvg-convert`, or ImageMagick
with the `MSYS2` / `Homebrew` SVG delegate) from the repo root:

## Required raster outputs

| Output file                                      | Source                   | Size (px)   | Notes                                                   |
|--------------------------------------------------|--------------------------|-------------|---------------------------------------------------------|
| `mobile/assets/icon.png`                         | `icon.svg`               | 1024×1024   | Expo `icon` field; iOS & Play listing.                  |
| `mobile/assets/adaptive-icon.png`                | `adaptive-foreground.svg`| 1024×1024   | Android foreground; background is `#0E7C3A` in app.json.|
| `mobile/assets/splash.png`                       | `splash.svg`             | 1242×2688   | Expo splash.                                            |
| `mobile/assets/favicon.png`                      | `icon.svg`               | 48×48       | Web build only.                                         |
| `mobile/store/feature-graphic.png`               | `splash.svg` (crop)      | 1024×500    | Play Store feature graphic.                             |
| `mobile/store/play-icon.png`                     | `icon.svg`               | 512×512     | Play Console hi-res icon upload.                        |

## One-liner (rsvg-convert)
```bash
cd mobile
rsvg-convert -w 1024 -h 1024 assets/brand/icon.svg                 -o assets/icon.png
rsvg-convert -w 1024 -h 1024 assets/brand/adaptive-foreground.svg  -o assets/adaptive-icon.png
rsvg-convert -w 1242 -h 2688 assets/brand/splash.svg               -o assets/splash.png
rsvg-convert -w 48   -h 48   assets/brand/icon.svg                 -o assets/favicon.png
rsvg-convert -w 512  -h 512  assets/brand/icon.svg                 -o store/play-icon.png
# Feature graphic: render splash at target size then crop to 1024x500
rsvg-convert -w 1024 -h 2218 assets/brand/splash.svg               -o store/_fg_tall.png
magick store/_fg_tall.png  -gravity center -crop 1024x500+0+0 +repage  store/feature-graphic.png
rm store/_fg_tall.png
```

## Fallback (ImageMagick only)
If you don't have `librsvg`, `magick convert -background none
-density 300 input.svg -resize 1024x1024 output.png` works but may
rasterize fonts differently.

## Visual QA
After rasterizing, eyeball the icon at 48×48 in a file browser. If the map
pin's schoolhouse is illegible at that size, simplify `icon.svg` before
shipping — Play Store previews the icon small.
