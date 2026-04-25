# Screenshot Plan

Play Console requires:
- **Phone**: 2–8 screenshots, min 320 px on short edge, 16:9 or 9:16.
- **7-inch tablet**: optional, recommended.
- **Feature graphic**: 1024×500 PNG/JPG (required).

## Phone screenshot storyboard (8 frames)
Each frame: screenshot + single-sentence caption overlaid top-center,
brand green (#0E7C3A) header bar.

1. **"65,000+ schools. Offline."** — search screen with "dhanmondi" typed,
   5 results visible.
2. **"Type an EIIN, get a school."** — search with "123456" typed, one exact
   match highlighted.
3. **"Every upazila. Every district."** — search with "Sylhet" typed, long
   result list.
4. **"Works with zero bars."** — airplane-mode indicator + working search
   (stage the airplane icon in the status bar screenshot).
5. **"Tap for full details."** — detail screen, full address + level visible.
6. **"See it on the map."** — detail screen scrolled to MapView with marker.
7. **"One tap to directions."** — detail screen with "Get Directions" CTA
   emphasized; second frame shows Google Maps route preview.
8. **"No ads. No tracking. Forever."** — settings / about screen.

## Feature graphic (1024×500)
Headline: **Find any school in Bangladesh — offline.**
Subline: **65,000+ schools. Zero data required.**
Visual: stylized map pin over a silhouette of Bangladesh, brand green.

## Capture workflow
1. Run app on Pixel 7 emulator (1080×2400) for phone frames.
2. Use `adb shell screencap -p /sdcard/s1.png && adb pull /sdcard/s1.png`.
3. Overlay captions in Figma — template at `store/figma-template.md` (TODO).
4. Export at 1080×2400, PNG, sRGB.
