# demo

The preview site for react-rewards, and the page the browser specs run against. It is a private workspace package, a React 19 and Rsbuild app ([ADR 0027](../docs/decisions/0027-react-demo-from-pr-5.md)) that imports the built library, as users do ([ADR 0031](../docs/decisions/0031-demo-imports-built-package.md)).

## Running it
- `pnpm dev` at the root rebuilds the library on change. Next to it, `pnpm --filter demo dev` serves the site at `/` and the fixtures at `/fixtures.html`.
- `pnpm e2e` at the root builds the library and the demo, then runs the Playwright specs in `e2e/`.
- `pnpm --filter demo typecheck` checks the demo against the built declarations. Run `pnpm build` first.

## Two pages
- `index.html` is the site. Its template applies the stored theme before the first paint.
- `fixtures.html` is the bare page the renderer and hook specs open ([ADR 0045](../docs/decisions/0045-fixture-page.md)). The site doesn't link to it.

## The site's design
The site documents the library, so its design decisions are kept here rather than in `docs/decisions/` ([ADR 0046](../docs/decisions/0046-adrs-cover-the-library.md)). Each says what was chosen and why. When the site changes, edit the decision in place, in the same PR. The visual direction (type, tokens, colours and motion) is in step 3 of the [v3 plan](../docs/plans/2026-10-22-v3-rewrite.md).

### Routing
- The URL hash names the page: `#getting-started`, `#confetti`, `#emoji`, `#balloon`. An effect's hash is its `name`, not its label, so Balloons is `#balloon`.
- An empty or unknown hash shows Getting started. The URL is left as it is.
- `hooks/use-hash` reads the hash with `useSyncExternalStore` and the `hashchange` event. There is no router.
- The document title follows the page, for example "Confetti · react-rewards".
- A new effect needs no routing code. Its page in `src/data/effects/` gives it a sidebar link and a hash.

Why: GitHub Pages serves static files only, so path routes such as `/emoji` would need a `404.html` redirect and the base path set in Rsbuild. Hashes give deep links, reloads and the back and forward buttons under any base path, with no dependency. The cost is that in-page anchors can't use the hash.

### Getting started
- The home page. Its Installation section has the install command, with a pnpm, npm, yarn and bun switch and a copy button. The choice is stored under `react-rewards:package-manager`.
- Its Usage section has a line on `useReward`, the first effect's snippet with its defaults and a copy button, and a pointer to the effects in the sidebar.

Why: the install command installs the whole library, so it is shown once rather than on every effect.

### Header and sidebar
- The logo is the README's `assets/react-rewards.png`, trimmed to its visible pixels and scaled to 56 px tall (265×56 px, 16 kB). It is shown 28 px tall, so it is sharp on 2x screens. It was made with macOS `sips`, and a new logo needs the same:
  ```sh
  sips -c 604 2857 --cropOffset 151 16 assets/react-rewards.png --out crop.png
  sips --resampleHeight 56 crop.png --out demo/src/components/header/logo.png
  ```
- The logo's alt text is "react-rewards", and it links to `#getting-started`. Biome's `useValidAnchor` rejects `href="#"`. Its orange-to-purple gradient is outside the site's palette, which is fine for a logo: logos are exempt from WCAG's contrast minimum.
- The sidebar is a navigation labelled "Pages", with two groups: "Guides", holding Getting started, and "Effects". Each heading labels its list. Items are plain links, and the current one has `aria-current="page"`.
- The active item has `--accent-text` text and a 2px `--accent-gradient` bar beside it. On phones every group's links share one row of pills that scrolls sideways, and the active pill has a 1px `--accent` border instead of the bar.

Why: sidebar items are small text, which needs 4.5:1. Gradient text fails on white (the amber end is 1.6:1). `--accent-text` is 5.1:1 in light mode and 6.5:1 in dark mode. The gradient fills shapes (buttons, the bar, the title's band) and never colours text.

### Page title
- The title is `--text`. Behind the lower third of the word is a band of the accent gradient, like a highlighter. The band is the `--title-band` token: the full gradient in light mode, and the gradient at 35% opacity (`#ff5f6d59` to `#ffc37159`) in dark mode.

Why: large text needs 3:1. Gradient text fails in light mode, and light text on the full gradient fails in dark mode (1.4:1 over the amber end). At 35%, the light text is 7.3:1 over the amber end and 10.1:1 over the coral end. Another opacity must keep 3:1 over the amber end: 50% gives 4.7:1.

### Preview and Code tabs
- Below an effect's title are two tabs. Preview holds the preview, the props panel and the props table. Code holds the snippet.
- Both panels stay mounted, and the one not shown is `hidden`, so opening Code doesn't cancel a running burst, and the snippet always reflects the panel.
- The tabs follow the WAI-ARIA tabs pattern: arrow keys, Home and End. Preview is selected on load and when the effect changes. The tab isn't kept in the URL.
- The preview has a "Reward me" button, which fires with the panel's settings, and no replay button: "Reward me" already fires again.
- The snippet is TSX. It calls `useReward` with a ref and fires with `reward()` from a click, as the preview does. Its config argument lists only the values that differ from the effect's defaults, and is left out when none do.

Why: the page follows reactbits.dev's structure, as the plan's layout does.

### Props panel
- Each effect's page in `src/data/effects/` lists a control per config field: a slider with its range, step and unit, a switch, or a list. `Controls<C>` maps each field to the control for its value's type, so a missing field or the wrong kind of control is a type error. The panel is generated from the list, so a new effect needs no panel code.
- `colors` shows a swatch per colour. Each is the browser's colour input, with × to remove it. A + tile is another colour input, and adds its colour when its picker closes. It listens for the native `change` event, because React's `onChange` fires on every `input` event while the picker is open. Colour inputs give lowercase `#rrggbb`, so a changed colour shows in lowercase in the snippet.
- `emojis` shows a chip per emoji, with ×, and a field that adds what is typed on Enter or +. The text is split with `Intl.Segmenter`, so an emoji made of several code points stays whole, and whitespace is dropped. Any character is accepted, because an emoji sprite draws any glyph.
- A list keeps at least one item. Lists come last and span the grid, so the cells before them fill it without gaps.
- The settings start from `effect.defaults`. Reset restores them, and they start afresh when the effect changes. They aren't kept in the URL.

Why: any colour or emoji can be tried, with no presets to maintain.

### Props table
- It lists every config field in the panel's order: the prop, its type (`number`, `boolean` or `string[]`, from its control), its default (from `effect.defaults`, written as in the snippet) and a description.
- The description is the field's JSDoc from `src/effects/<name>/types.ts`, copied next to its control, without references to ADRs. Text in backticks shows as code. Nothing checks that the copies match, so a change to a field's JSDoc has to be copied by hand.
- The burst options (`zIndex`, `onComplete`, `respectReducedMotion` and `seed`) aren't listed. The library's README documents them.
- On phones the table scrolls sideways inside its frame, so the page doesn't.

### Code colours
- shiki highlights the snippets with its CSS-variables theme, with the prefix `--code-`. The variables are tokens in `src/styles/tokens.css`, so the code follows the theme switcher and the system's appearance with no script.
- The colours, with their contrast on the code panel (`--card`: `#ffffff` light, `#16171a` dark):

  | Variable | Light | Dark | Colours, in the snippet |
  |---|---|---|---|
  | `--code-foreground` | `--text`, `#090a0b` (19.8:1) | `--text`, `#f4f4f5` (16.3:1) | Brackets, semicolons and other names. `--code-token-function` and `--code-token-parameter` point here, so function, component, type and JSX attribute names share it. |
  | `--code-token-keyword` | `--accent-text`, `#cc3344` (5.1:1) | `--accent-text`, `#ff5f6d` (6.1:1) | Keywords, `=`, `=>` and the colon after a property name. `--code-token-link` points here. |
  | `--code-token-string` | `#9a5800` (5.6:1) | `--accent-2`, `#ffc371` (11.4:1) | Strings and JSX tag names, through `--code-token-string-expression`, which points here. |
  | `--code-token-constant` | `#c2410c` (5.2:1) | `#ff916f` (8.1:1) | Numbers, `null`, `true`, `false`, and names declared with `const`. The dark value is halfway between the blog's coral and amber. |
  | `--code-token-punctuation`, `--code-token-comment` | `--text-muted`, `#697277` (4.9:1) | `--text-muted`, `#9eabb3` (7.6:1) | Commas, and comments. |

- shiki loads with a dynamic import after the first paint: `shiki/core`, the JavaScript regex engine (no WebAssembly) and the `tsx` grammar only. Until then the code shows as plain text. The tokens render as React elements from `codeToTokens`, not as inserted HTML.
- The install command isn't highlighted.
- At phone width, code scrolls under the copy button in the corner, so there it starts below the button.

Why: step 3 of the plan makes every colour a token. The theme groups tokens coarsely, so function names share the foreground and JSX tags share the string colour. A changed colour must keep 4.5:1 on `--card`.
