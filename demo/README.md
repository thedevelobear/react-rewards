# demo

The preview site for react-rewards, and the page the browser specs run against. It is a private workspace package, a React 19 and Rsbuild app ([ADR 0027](../docs/decisions/0027-react-demo.md)) that imports the built library, as users do ([ADR 0031](../docs/decisions/0031-demo-imports-built-package.md)).

## Running it
- `pnpm dev` at the root rebuilds the library on change. Next to it, `pnpm --filter demo dev` serves the site at `/` and the fixtures at `/fixtures.html`.
- `pnpm e2e` at the root builds the library and the demo, then runs the Playwright specs in `e2e/`.
- `pnpm --filter demo typecheck` checks the demo against the built declarations. Run `pnpm build` first.

## Two pages
- `index.html` is the site. Its template applies the stored theme before the first paint.
- `fixtures.html` is the bare page the renderer and hook specs open ([ADR 0045](../docs/decisions/0045-fixture-page.md)). The site doesn't link to it, and its `robots` tag, `noindex`, keeps it out of search results.

## The site's design
The site documents the library, so its design decisions are kept here rather than in `docs/decisions/` ([ADR 0046](../docs/decisions/0046-adrs-cover-the-library.md)). Each says what was chosen and why. When the site changes, edit the decision in place, in the same PR.

### Visual direction
- Dark first: a near-black ground, panels one step lighter, 1 px borders, and one coral accent. The light theme mirrors the dark one's steps. There are no gradients. The only shadows are the accent's glow, a soft coral light like the glow under the blog's "Previous Posts" button (see "Accent glow").
- Type: Geist for UI and Geist Mono for code and small labels, self-hosted through Fontsource, weights 400 to 600. UI text is 13 to 14 px with `-0.01em` tracking, and paragraphs 15.5 px at 1.6 line height. The page title is 64 px (40 px on phones), weight 600, `-0.045em`. Section titles are 24 px, weight 600, `-0.025em`. Group labels are mono, 11 px, uppercase, with `0.1em` tracking.
- Shape: radii of 6, 10, 12, 14, 16 and 20 px and full. The props panel's compact controls keep 7 px.
- Size: what people tap is 44 px tall: the header's buttons, the sidebar's links, the tabs, and the copy and Reset buttons. The props panel's controls stay 32 px, as a dense grid. The header is 68 px. The content is at most 800 px wide, beside a 240 px sidebar, and the header lines up with them.
- Motion: `cubic-bezier(.23, 1, .32, 1)`, 0.12 to 0.3 s. Reduced motion turns UI transitions off.
- Every colour is a token in `src/styles/tokens.css`, defined for light, `[data-theme="dark"]` and the dark media query. Contrast is checked with the WCAG formula, on the darkest surface a colour sits on:

  | Token | Light | Dark | Use, and contrast |
  |---|---|---|---|
  | `--bg` | `#ffffff` | `#0a0a0b` | The page. |
  | `--card` | `#fafafa` | `#0f0f11` | Panels: the preview, the install command, code, cards, the pager. |
  | `--inset` | `#f4f4f5` | `#121214` | Recessed areas: card drawings, step numbers, table heads, hovers. |
  | `--surface` | `#f4f4f5` | `#151517` | Controls, inline code and the active sidebar item. |
  | `--surface-hover` | `#e9e9ec` | `#1c1c1f` | Controls on hover. |
  | `--border` | `#e4e4e7` | `#1e1e22` | Panels and dividers. |
  | `--border-strong` | `#d4d4d8` | `#26262b` | Controls. |
  | `--dot` | `#dcdce0` | `#202025` | The dot grids. |
  | `--text` | `#09090b` | `#f4f4f5` | 18.1:1 and 16.6:1. |
  | `--text-secondary` | `#3f3f46` | `#d4d4d8` | Button labels. 9.5:1 and 12.3:1. |
  | `--text-muted` | `#52525b` | `#a1a1aa` | Paragraphs and idle links. 7.0:1 and 7.1:1. |
  | `--text-subtle` | `#66666f` | `#8b8b94` | Labels and captions. 5.2:1 and 5.4:1. |
  | `--accent` | `#ff6b57` | same | Fills: the preview's button, the active tab's line, dots and icons. 2.8:1 on white, so never small text there. |
  | `--accent-hover` | `#ff7f6e` | same | The preview's button on hover. |
  | `--accent-text` | `#c4381f` | `#ff6b57` | Accent text and links. 4.9:1 and 6.5:1. |
  | `--ink` | `#0a0a0b` | same | Text on the accent, 7.1:1. |
  | `--focus` | `#7c3aed` | `#a78bfa` | The focus ring, `2px solid` with a 2 px offset. 5.2:1 and 6.7:1. |
  | `--success` | `#047857` | `#6ee7b7` | The copied tick and the preview's live dot. 5.0:1 and 12.0:1. |
  | `--knob` | `#ffffff` | same | The switch's knob. |
  | `--art-*` | violet, amber, sky, mint | same | The effect cards' drawings, and `--art-line` (`#c4c4cc` light, `#3a3a40` dark) for the balloon's string. Decorative. |
  | `--code-*` | see "Code colours" | | Each 4.5:1 or more on `--card`. |

- Theme: a header button cycles system, light and dark. The choice is stored in `localStorage` under `react-rewards:theme`, and set as `data-theme` on `<html>` by an inline script before first paint.
- The browser's bar is `--bg`, through two `theme-color` tags in `index.html`, one for each `prefers-color-scheme`. `useTheme` sets both to the chosen theme's colour, and gives each its own colour back for "system".

Why: a dark, quiet page lets the effects carry the colour. Each text colour keeps 4.5:1 on every surface it sits on, and the focus ring and ticks keep 3:1. Coral text fails on white, so light mode has a darker `--accent-text`.

### Accent glow
- The accent glows wherever it marks something, in the accent's colour, from tokens in `src/styles/tokens.css`:
  - `--accent-glow`, `0 12px 40px -12px`: under the preview's button.
  - `--accent-glow-line`: under the selected tab's line, in the Preview and Code tabs and the install command. It isn't a shadow, which isn't painted inside its own box and so showed the tab's edges. It is a radial gradient on a layer under the line, 24 px wider on each side, at 15% opacity, that lights only downwards, and fades out sideways past the line's ends. Tabs are positioned, so the layer paints over what follows.
  - `--accent-glow-mark`, `0 0 10px`: around the sidebar's dot, the sliders' thumbs and a switch that is on. The sidebar's active icon and the pager's arrows have a 4 px `drop-shadow` of the accent.
- The glow is decorative and carries no meaning of its own, so it needs no contrast. Glows that change animate with the UI's transitions.

Why: the glow under the preview's button made the accent read as light rather than paint, so the other accent marks share it.

### Routing
- The URL hash names the page: `#getting-started`, `#custom-effects`, `#server-rendering`, `#upgrading-from-v2`, `#stress-test`, `#use-reward`, `#fire`, `#renderers`, `#confetti`, `#emoji`, `#balloon`, `#firework`. An effect's hash is its `name`, not its label, so Balloons is `#balloon` and Fireworks `#firework`.
- An empty or unknown hash shows Getting started. The URL is left as it is.
- `hooks/use-hash` reads the hash with `useSyncExternalStore` and the `hashchange` event. There is no router.
- The document title follows the page, for example "Confetti · react-rewards".
- A new page needs no routing code. An effect's page in `src/data/effects/`, or an article's entry in `src/data/articles/list.ts`, gives it a sidebar link and a hash.
- Going to another page scrolls to the top, because the pager's links are at the bottom. A reload keeps the browser's scroll.

Why: GitHub Pages serves static files only, so path routes such as `/emoji` would need a `404.html` redirect and the base path set in Rsbuild. Hashes give deep links, reloads and the back and forward buttons under any base path, with no dependency. The cost is that in-page anchors can't use the hash.

### Getting started
- The home page. Under the title is a preview of the first effect with its defaults, captioned "Every call to reward() fires a new burst."
- Then three numbered steps, joined by a line.
  1. "Install the package": the install command, with a tab per package manager (pnpm, npm, yarn, bun) and a copy button. The choice is stored under `react-rewards:package-manager`.
  2. "Fire your first reward": a line on `useReward` with a link to its page, and the first effect's snippet with its defaults, as `RewardButton.tsx`.
  3. "Pick an effect": a card per effect, linking to its page, with its label and description. Each card has a drawing of its effect, from `articles/getting-started/art.tsx`. An effect without a drawing shows its icon instead, at the drawings' size and stroke, so a new effect needs no code here.
     - The drawings are line drawings on a 24 px grid, shown at 64 px. They share one stroke width, 1.5 on the grid (about 4 px on screen), with round caps and joins and no fill. Each is path data with a colour per stroke, drawn by one component.
     - The paths come from Tabler Icons (MIT, Paweł Kuna) and, for fireworks, Hugeicons' free set (MIT, Hugeicons). A comment in `art.tsx` keeps their notices.
     - Each has several colours: the main shape in `--accent`, and the small bits in the `--art-*` colours. The balloon is the exception, an `--art-sky` body with the accent on its shine. Confetti is an `--accent` popper, with plus signs and short lines in `--art-violet`, `--art-amber`, `--art-sky` and `--art-mint`. Emoji is two hearts: an `--accent` one in front of a larger `--art-violet` one. Balloons is an `--art-sky` balloon with an `--accent` shine and an `--art-line` string. Fireworks is four curved `--accent` lines bursting from one point, with sparks alternating `--art-amber` and `--art-sky` around them.

Why: the install command installs the whole library, so it is shown once rather than on every effect. The steps read in the order a newcomer works, and the preview shows the result before any of them. Drawings on one grid, at one size and stroke, read as one set.

### Stress test
- The last page under Guides, which shows the engine's headroom. Its title is "Stress test".
- Its Customize section has three settings: the effect (Confetti, Emoji, Balloons, Fireworks), the count (a slider from 100 to 20000 in steps of 100, starting at 5000) and the renderer (Auto, WebGL, Canvas 2D). The burst uses the effect's defaults apart from the count.
- The count is particles. Fireworks' `count` is rockets, so for them the page asks for `max(1, round(particles / 130))` rockets: at the defaults a rocket peaks at about 126 live particles. A line under the settings says so, for example "Fireworks count rockets, which make the particles, so this count is approximate: 5000 particles is 38 rockets." Another effect whose `count` isn't particles adds its own entry to `UNITS` in `articles/stress-test/component.tsx`.
- The renderer calls `setRenderer`, which applies to the whole page, so leaving the Stress test sets it back to Auto. Effect pages always use Auto.
- The preview is the effect pages' preview. Its top right corner holds the readout, a small mono tag. Before a burst it reads "Ready". While a burst runs, it shows the burst's renderer ([ADR 0047](../docs/decisions/0047-burst-renderer.md)) and the fps over the last half second. After the burst, it shows the average fps over the whole burst, followed by "avg". Bursts fired while one runs are counted with it. A burst that is skipped reads "Skipped", for example under reduced motion, or when the forced renderer isn't available.
- The fps is the number of `requestAnimationFrame` callbacks a second. The page counts them only while a burst runs.
- The effect pages have no readout and no renderer setting. Their count sliders keep their own ranges.
- The site has no card showing that bursts aren't clipped. The fixture page has one, which the smoke spec checks ([ADR 0045](../docs/decisions/0045-fixture-page.md)).
- The benchmark harness drives this page through its controls ([ADR 0048](../docs/decisions/0048-benchmark-script-in-demo.md)), so it gets the same rockets for its particle counts. A change to the page has to keep the settings' names, the button's and the readout's `data-testid`s, and the readout's `data-state`, or update the harness.

Why: one page for performance keeps the effect pages about the API, and keeps their sliders fine enough for everyday counts.

### Header and sidebar
- The header holds the logo, a mono "docs" tag, a "GitHub" button with an arrow, and the theme switcher. The tag is hidden below 380 px, so the rest fits a small phone.
- The theme switcher is an icon button showing the current theme. Its name, "Theme: System" for example, is visually hidden, and its tooltip names the next theme.
- The logo is the README's `assets/react-rewards.png`, trimmed to its visible pixels and scaled to 56 px tall (265×56 px, 16 kB). It is shown 28 px tall, so it is sharp on 2x screens. It was made with macOS `sips`, and a new logo needs the same:
  ```sh
  sips -c 604 2857 --cropOffset 151 16 assets/react-rewards.png --out crop.png
  sips --resampleHeight 56 crop.png --out demo/src/components/header/logo.png
  ```
- The logo's alt text is "react-rewards", and it links to `#getting-started`. Biome's `useValidAnchor` rejects `href="#"`. Its orange-to-purple gradient is outside the site's palette, which is fine for a logo: logos are exempt from WCAG's contrast minimum.
- The sidebar is a navigation labelled "Pages", with three groups: "Guides" (Getting started, Custom effects, Server rendering, Upgrading from v2 and Stress test), "API" (useReward, fire and Renderers), and "Effects". Each heading labels its list. Items are links with an icon, and the current one has `aria-current="page"`.
- Each page names its icon in `src/data/` (see "Icons").
- The active item has a `--surface` background, `--text` text, an `--accent` icon and an `--accent` dot at its end, both glowing. On phones every group's links share one row of 44 px pills that scrolls sideways, and the active pill has a `--surface` background and no dot.

Why: the item's text stays in text colours, which keep 4.5:1, and the accent marks it with shapes, which need no text contrast.

### Icons
- Every icon is path data on a 24 px grid, in `ICON_PATHS` in `components/icon/paths.ts`, keyed by a kebab-case name that says what it draws, such as `arrow-right` or `balloon`. Shapes such as rectangles and circles are written as paths too.
- `components/icon` draws one by name, as a stroke in `currentColor`, 2 px wide by default, and hidden from screen readers, because text beside it names it. Components pass a size and, where needed, a stroke width. No other component draws its own icon.
- The effect cards on Getting started show drawings, not icons: line drawings in several colours, which a `currentColor` icon can't be. They live in `articles/getting-started/art.tsx`, not in `ICON_PATHS` (see "Getting started").
- Pages name their icon in `src/data/`, so the type of `icon` is the list of names, and a missing icon is a type error. A new page adds its icon to `ICON_PATHS`.
- The fireworks' icon, `firework`, is a wavy trail rising from the bottom left to an eight-ray burst at the top right. The trail stops short of the burst, and the rays leave a hole in the middle, as `burst`'s do, so it reads as a firework at 16 px rather than a flower on a stem.

Why: one set of icons and one component keeps every icon the same weight, and nothing is drawn twice.

### Favicon and link previews
- The favicon is the logo's "r" in white and its yellow star (`#f2bd31`), on a tile with rounded corners and the logo's gradient, `#e86444` at the top left to `#924e93` at the bottom right. The letter and the star are traced from `assets/react-rewards.png`.
- The build copies `demo/public/` to the site's root:
  - `favicon.svg` is the source. Rsbuild links it from every page through `html.favicon`. Without that setting it would link the ICO.
  - `favicon.ico` is 32 px, for browsers without SVG favicons. `index.html` links it with `sizes="32x32"`, so browsers that can show the SVG prefer it.
  - `apple-touch-icon.png` is 180 px with square corners, because iOS rounds the corners itself and fills transparency with black.
  - `og-image.png` is the card shown when a link to the site is shared.
- The ICO and the Apple icon are made from the SVG with macOS `sips`. From `demo/`:
  ```sh
  sips -s format ico -z 32 32 public/favicon.svg --out public/favicon.ico
  sed 's/ rx="14"//' public/favicon.svg > square.svg
  sips -s format png -z 180 180 square.svg --out public/apple-touch-icon.png
  ```
- The share card is 1200×630 px: the logo on the dark theme's `--bg` and the preview's dot grid, "Reward micro-interactions for React" in Geist, and the effects in Geist Mono. Its source is `og-image/card.html`, rendered with Playwright. From `demo/`:
  ```sh
  pnpm exec playwright screenshot --viewport-size "1200, 630" "file://$PWD/og-image/card.html" public/og-image.png
  ```
  The card and the page's description both name the effects, so a new effect updates both, and the card is rendered again.
- `index.html` has Open Graph tags (the title, description, URL and card, with the card's size and alt text), and `twitter:card` set to `summary_large_image`, which X reads alongside them. A canonical link names the same URL. These URLs are absolute, on `thedevelobear.github.io/react-rewards/`, because crawlers don't resolve relative ones, so moving the site means updating them.
- The site has no `.nojekyll`, `404.html`, `robots.txt`, sitemap or web app manifest. The Pages workflow uploads the build, so Jekyll never runs. Routes are hashes, so every page is `index.html`. Crawlers read `robots.txt` only at the domain's root, not in a project site. The site isn't meant to be installed.

Why: the white letter on the tile stays legible at 16 px on light and dark tab bars, where the gradient letter on its own was faint. A shared link shows the logo and what the library does.

### Page title
- Above the title is a breadcrumb, a navigation labelled "Breadcrumb": the page's sidebar group, a chevron, and the page, which has `aria-current="page"`. The group isn't a link, because it has no page.
- The title is `--text`, and the description under it is `--text-muted` at 19 px (17 px on phones), at most 560 px wide.

### Preview
- A 320 px stage with a `--dot` grid on `--card`, and a "Reward me" button at its centre that fires the effect from there. The button is an `--accent` pill with `--ink` text and the effect's icon.
- Its top left corner names the effect, "Live preview · confetti", after a `--success` dot. The top right corner holds what the page puts there, such as the Stress test's readout. On a narrow stage, the corner wraps under the name.
- A caption under the button says what the settings don't: "Every call to reward() fires a new burst." on Getting started, and "Fireworks look best on dark backgrounds. Just like in real life." on the Fireworks page, since white shells are faint on the light theme. An effect's page sets it with `caption` in `src/data/effects/`.
- There is no replay button: "Reward me" already fires again.
- The stage is 320 px for every effect. Bursts are drawn on the page's overlay, which the stage doesn't clip, so an effect that rises higher draws over the page above it. Fireworks' shells burst about 376 px above the button and reach about 470 px, as confetti does, far past the stage's top edge, which is kept: a taller stage for one effect would make the pages differ, and the overflow shows the bursts aren't clipped.

### Preview and Code tabs
- Below an effect's title are two tabs, underlined in `--accent` when selected, with the line's glow under it, as the install command's are. Preview holds the preview, the props panel and the props table. Code holds the snippet, as `RewardButton.tsx`.
- Both panels stay mounted, and the one not shown is `hidden`, so opening Code doesn't cancel a running burst, and the snippet always reflects the panel.
- The tabs follow the WAI-ARIA tabs pattern: arrow keys, Home and End. Preview is selected on load and when the effect changes. The tab isn't kept in the URL.
- The preview fires with the panel's settings.
- The snippet is TSX. It calls `useReward` with a ref and fires with `reward()` from a click, as the preview does. Its config argument lists only the values that differ from the effect's defaults, and is left out when none do.

Why: the page follows reactbits.dev's structure, as the plan's layout does.

### Props panel
- Each effect's page in `src/data/effects/` lists a control per config field: a slider with its range, step and unit, a switch, or a list. Each control is a bordered cell in a grid of three, two or one columns, by the panel's width. `Controls<C>` maps each field to the control for its value's type, so a missing field or the wrong kind of control is a type error. The panel is generated from the list, so a new effect needs no panel code.
- `colors` shows a swatch per colour. Each is the browser's colour input, with × to remove it. A + tile is another colour input, and adds its colour when its picker closes. It listens for the native `change` event, because React's `onChange` fires on every `input` event while the picker is open. Colour inputs give lowercase `#rrggbb`, so a changed colour shows in lowercase in the snippet.
- `emojis` shows a chip per emoji, with ×, and a field that adds what is typed on Enter or +. The text is split with `Intl.Segmenter`, so an emoji made of several code points stays whole, and whitespace is dropped. Any character is accepted, because an emoji sprite draws any glyph.
- A list keeps at least one item. Lists come last and span the grid, so the cells before them fill it without gaps.
- The settings start from `effect.defaults`. Reset restores them, and they start afresh when the effect changes. They aren't kept in the URL.

Why: any colour or emoji can be tried, with no presets to maintain.

### Props table
- It lists every config field in the panel's order: the prop, its type (`number`, `boolean` or `string[]`, from its control), its default (from `effect.defaults`, written as in the snippet) and a description.
- The description is the field's JSDoc from `src/effects/<name>/types.ts`, copied next to its control, without references to ADRs. Text in backticks shows as code. Nothing checks that the copies match, so a change to a field's JSDoc has to be copied by hand.
- The burst options (`zIndex`, `onComplete`, `respectReducedMotion` and `seed`) aren't listed. The useReward page documents them.
- On phones the table scrolls sideways inside its frame, so the page doesn't.

### Code blocks
- A code block has a header with a file icon, the file name, a "tsx" or "ts" tag and the copy button. Both are highlighted with the `tsx` grammar. Under it, the code has line numbers in a column of their own, outside the `<pre>`, so they aren't copied or read out. The code scrolls sideways, and the numbers stay put.
- The install command is a `$` prompt, which isn't copied, and the command, in mono. It isn't highlighted.

### Code colours
- shiki highlights the snippets with a theme of the site's own, in `components/code-block/highlight.ts`. It maps TextMate scopes to the `--code-*` tokens in `src/styles/tokens.css`, so the code follows the theme switcher and the system's appearance with no script. A deeper scope wins, so `=>` and a string's quotes override the rules for `storage` and `punctuation`.
- The colours, with their contrast on the code panel (`--card`: `#fafafa` light, `#0f0f11` dark):

  | Token | Light | Dark | Colours, in the snippet |
  |---|---|---|---|
  | `--code-foreground` | `#18181b` (17.0:1) | `#e7e7ea` (15.5:1) | Variables, properties and JSX text. |
  | `--code-keyword` | `--accent-text`, `#c4381f` (5.1:1) | `#ff8a7a` (8.4:1) | Keywords, and `null`, `true`, `false` and numbers. |
  | `--code-string` | `#8f5500` (5.8:1) | `#f2c46d` (11.8:1) | Strings, with their quotes. |
  | `--code-function` | `#0b65a8` (5.9:1) | `#7cc7ff` (10.5:1) | Names of functions, hooks and components, where they are declared or called. |
  | `--code-type` | `#7136d9` (6.2:1) | `#c4a7ff` (9.4:1) | Types and JSX attribute names. |
  | `--code-tag` | `#08775a` (5.3:1) | `#7ee0b8` (12.1:1) | JSX tag names. |
  | `--code-punctuation` | `--text-subtle`, `#66666f` (5.4:1) | `#9a9aa3` (6.9:1) | Brackets, separators, operators such as `=` and `=>`, and comments. |
  | `--code-line-number` | `--text-subtle`, `#66666f` (5.4:1) | `#80808a` (4.9:1) | Line numbers. |

- shiki loads with a dynamic import after the first paint: `shiki/core`, the JavaScript regex engine (no WebAssembly) and the `tsx` grammar only. Until then the code shows as plain text. The tokens render as React elements from `codeToTokens`, not as inserted HTML.

Why: every colour is a token, so code follows the theme like the rest of the page. Each kind of name has its own hue, and every colour keeps 4.5:1 on `--card`.

### Articles
- The pages that aren't effects are articles: the guides and the API's pages. Each is an entry in `src/data/articles/list.ts`, with its name, label, description, icon and content, and its content is a component in `src/articles/<name>/`. The site's own pages, Getting started and the Stress test, are articles too.
- The library's documentation lives in the articles, and the root README keeps the basics and links to them ([ADR 0062](../docs/decisions/0062-docs-on-the-site.md)). The guides are Custom effects, Server rendering and Upgrading from v2. The API's pages are useReward (its arguments, settings, burst options, return value, the pointer, and picking an effect at runtime), fire, and Renderers (how bursts are drawn, `setRenderer`, and the benchmark).
- An article is TSX, with no Markdown step. It is a series of `components/section` blocks, each an `h2` with paragraphs, lists, code blocks and tables. Paragraphs and lists directly in a section are prose: `--text-muted`, 15.5 px at 1.6 line height, at most 680 px wide, with bold leads in `--text`. Code inside text is a chip, which keeps its border when it wraps.
- Tables are `components/data-table`, as the props table is. Cells in a table's data can hold code in backticks, which `components/code-text` turns into chips.
- The settings table on the useReward page is generated from the effects' pages, with each effect's default, so it can't drift from the library. It counts colours instead of listing them, and links to each effect's page for the rest.
- Links between pages are plain hashes, such as `#use-reward`, because the hash is the route and sections can't be linked. A browser spec visits every page in the sidebar and checks that each such link names a page. Links to the repo, such as the effect guide or the benchmark, point at `master` on GitHub.

Why: one copy of each fact, on the page people already use to try the effects, and pages that look like the rest of the site with no new dependency.

### Pager
- Every page ends with cards for the pages before and after it, in the sidebar's order, in a navigation labelled "Previous and next". A card shows "Previous" or "Next", in mono, the page's label, and an `--accent` arrow. Getting started has only a next card, and the last effect only a previous one.
- The cards have no glow. On hover, their border strengthens to `--border-strong`. The arrow has a 4 px `drop-shadow` of the accent.

Why: a reader can go through the site in order without going back up to the sidebar.
