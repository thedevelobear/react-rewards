# 0053. The code colours are tokens in `tokens.css`

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan highlights the snippet with `shiki`, and its theme follows the site theme. The same step says every colour is a token in `tokens.css`, defined for light, for the switcher's dark choice and for the system's dark mode. shiki's ready-made themes, such as `github-light` and `github-dark`, bring their own colours. Shiki also has a CSS-variables theme, which colours each token with a CSS variable instead.

Options considered:
- shiki's CSS-variables theme, with the colours set in `tokens.css` from the blog's palette.
- `github-light` and `github-dark`, as shiki's dual themes switched with CSS.
- `vitesse-light` and `vitesse-dark`, switched the same way.

## Decision
- The snippet is highlighted with shiki's CSS-variables theme (`createCssVariablesTheme`), with the variable prefix `--code-`. The variables are tokens in `tokens.css`, in the light block and in both dark blocks.
- The colours, with their contrast on the code panel (`--card`: `#ffffff` light, `#16171a` dark). Most of them are existing tokens, so they follow the theme through those:

  | Variable | Light | Dark | Colours, in the snippet |
  |---|---|---|---|
  | `--code-foreground` | `--text`, `#090a0b` (19.8:1) | `--text`, `#f4f4f5` (16.3:1) | Brackets, semicolons and other names. `--code-token-function` and `--code-token-parameter` point here, so function, component, type and JSX attribute names share it. |
  | `--code-token-keyword` | `--accent-text`, `#cc3344` (5.1:1) | `--accent-text`, `#ff5f6d` (6.1:1) | Keywords, `=`, `=>` and the colon after a property name. `--code-token-link` points here. |
  | `--code-token-string` | `#9a5800` (5.6:1) | `--accent-2`, `#ffc371` (11.4:1) | Strings and JSX tag names, through `--code-token-string-expression`, which points here. |
  | `--code-token-constant` | `#c2410c` (5.2:1) | `#ff916f` (8.1:1) | Numbers, `null`, `true`, `false`, and names declared with `const`. |
  | `--code-token-punctuation`, `--code-token-comment` | `--text-muted`, `#697277` (4.9:1) | `--text-muted`, `#9eabb3` (7.6:1) | Commas, and comments. |

  The dark orange is halfway between the blog's coral and amber. `--code-background` is `--card`.
- shiki is loaded with a dynamic import after the first paint. The highlighter is fine-grained: `shiki/core`, the JavaScript regex engine (no WebAssembly) and the `tsx` grammar only. Until it has loaded, the snippet shows as plain text.
- The highlighted tokens are rendered as React elements from `codeToTokens`, not inserted as HTML.
- The install command isn't highlighted.

## Consequences
- The code follows the theme switcher and the system's appearance with no script and no flash, like the rest of the site.
- The CSS-variables theme groups tokens more coarsely than a full theme. Function names share the foreground colour, and JSX tags share the string colour.
- A changed code colour must keep 4.5:1 on `--card` in its theme.
- Another language needs its grammar imported.
