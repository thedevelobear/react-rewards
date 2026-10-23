# 0050. The page title is highlighted by a gradient band behind it

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan lists `--accent-gradient` for "the page-title highlight" without saying what the highlight is. The title is the effect's name, such as "Confetti", at 3rem. Large text needs 3:1 for WCAG AA.

- Gradient text fails in light mode: the amber end is 1.6:1 on white.
- A full-strength band behind the text passes in light mode, where the text is ink (6.7:1 on coral, 12.6:1 on amber). It fails in dark mode, where the text is `#f4f4f5` (2.7:1 on coral, 1.4:1 on amber).

Options considered:
- A band behind the lower part of the word, like a highlighter, softened in dark mode.
- A gradient bar just below the baseline that never sits behind the letters.
- Gradient text.
- No highlight.

## Decision
- The title's text is `--text`. Behind the lower third of the word sits a band of the accent gradient, like a highlighter.
- The band is the full `--accent-gradient` in light mode. In dark mode it is the same gradient at 35% opacity over the background, which keeps the light text at 7.3:1 (amber end) to 10.1:1 (coral end).
- The band is a token, `--title-band`, defined per theme in `tokens.css`.

## Consequences
- The title passes AA in both themes, and reads as highlighted in both.
- The dark band is duller than the light one. A different opacity must keep the light text at 3:1 or more over the amber end: 50% gives 4.7:1.
