# 0052. List settings are edited as swatches and chips

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Three settings are lists of strings: `colors` for confetti and balloons, and `emojis` for emoji. Step 3 of the plan mentions "colour swatches" in the props panel without saying how a list is edited, and says nothing about the emoji list.

Options considered:
- Editable swatches and chips: change, remove and add your own values.
- Presets: pick one of a few named palettes or emoji sets.
- A text field per list: comma-separated hex colours, or typed emoji.

## Decision
- `colors` shows one swatch per colour. A swatch is the browser's colour input (`<input type="color">`), so clicking it opens the native picker, and the burst uses the colour while it changes. Each swatch has a × button that removes it.
- After the swatches, a + tile is another colour input. The colour picked in it is added when its picker closes (the input's `change` event).
- `emojis` shows one chip per emoji, each with a × button. A text field after the chips adds what was typed, when Enter or its + button is pressed. The text is split into characters with `Intl.Segmenter`, so an emoji made of several code points stays whole, and whitespace is dropped. Any character is accepted, because an emoji sprite draws any glyph.
- A list keeps at least one value: the × button is disabled on the last one. There is no upper limit, and the swatches and chips wrap.
- The list cell spans the whole width of the props panel's grid. Lists come last in an effect's controls, so the cells before them fill the grid without gaps. The props table follows the same order ([ADR 0054](0054-props-table-with-descriptions.md)).

## Consequences
- Any colour and any emoji can be tried, with no presets to maintain.
- The colour input's look differs between browsers, so the swatch styles the input itself and hides the browser's inner border.
- A colour input always gives lowercase `#rrggbb`. The effects' defaults use uppercase, so a changed colour shows in lowercase in the snippet.
