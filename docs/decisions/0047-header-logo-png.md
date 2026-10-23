# 0047. The header shows the existing logo PNG

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan puts "the logo" in the site header without saying which. The repo's only logo is `assets/react-rewards.png`, used by the README: 2873×1082 px and 109 kB, with transparent margins. Its gradient runs from orange (about `#E96443`) to purple (about `#904E95`), which differs from the blog's coral-to-amber palette.

Options considered:
- A text wordmark in Geist with the accent gradient.
- The existing PNG, downscaled.
- A text wordmark with a small inline-SVG confetti mark in the palette's colours.

## Decision
- The header shows the existing logo. `demo/src/components/header/logo.png` is a copy trimmed to its visible pixels and scaled to 56 px tall (265×56 px, 16 kB). It is shown 28 px tall, so it is sharp on 2x screens.
- The copy was made with macOS `sips`:
  ```sh
  sips -c 604 2857 --cropOffset 151 16 assets/react-rewards.png --out crop.png
  sips --resampleHeight 56 crop.png --out demo/src/components/header/logo.png
  ```
- Its alt text is "react-rewards", and it links to the first effect's hash, `#confetti` ([ADR 0046](0046-hash-routing.md)). It isn't `href="#"`, because Biome's `useValidAnchor` rule rejects that.
- `assets/react-rewards.png` stays as it is.

## Consequences
- The site keeps the project's brand mark. Its colours are outside the site's palette. Logos are exempt from WCAG's contrast minimum, and the purple end is 3.4:1 on the dark background.
- A new logo needs the copy remade with the commands above.
