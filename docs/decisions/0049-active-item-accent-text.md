# 0049. The active sidebar item uses accent text and a gradient bar

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan gives the active sidebar item "the gradient text and a 2px gradient bar". Sidebar items are 0.85rem, so their text needs 4.5:1 for WCAG AA. On the light background, the gradient's coral end is 2.95:1 and its amber end 1.6:1. The same step already moved small accent text in light mode to a darker coral (`--accent-text`, `#CC3344`) for this reason. On the dark background, both ends pass.

Options considered:
- Accent text with a gradient bar, in both themes.
- Gradient text in dark mode only, and accent text in light mode.
- Gradient text in both themes, as specified, with light mode failing the check.

## Decision
- The active item's text is `--accent-text`: `#CC3344` in light mode (5.1:1 on white) and `#FF5F6D` in dark mode (6.5:1). The 2px bar beside it is `--accent-gradient`, in both themes.
- On phones, where the items are a row of pills, the active pill has `--accent-text` text and a 1px `--accent` border instead of the bar.

## Consequences
- The active item passes AA in both themes. The gradient still marks it, through the bar.
- The gradient fills shapes (buttons, the bar and the title's band, [ADR 0050](0050-title-marker-band.md)) and never colours text.
