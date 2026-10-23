# 0051. Preview and Code are tabs on the effect's page

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan stacks the preview, the props panel, the code section and the props table on one page, and also gives the code section "Preview and Code tabs". Both can't hold: if the tabs switch between the preview and the code, the two aren't stacked.

Options considered:
- Tabs below the page title, as on reactbits.dev. Preview shows the preview, the props panel and the props table. Code shows the install command and the snippet.
- No tabs. Everything is stacked, and the snippet updates while a slider moves.
- Everything stacked, with the code frame's tabs switching between a `useReward` snippet and a vanilla `fire()` snippet.

## Decision
- Below the page title sits a tab list with two tabs, Preview and Code.
  - Preview holds the preview container, the props panel and the props table.
  - Code holds the generated snippet. The install command is on the Getting started page ([ADR 0055](0055-getting-started-home-page.md)).
- Both panels stay mounted. The one not shown has the `hidden` attribute. Opening Code doesn't cancel a running burst, and the snippet always reflects the props set in Preview.
- The tabs follow the WAI-ARIA tabs pattern: arrow keys, Home and End move between them. Preview is selected on load and when the effect changes. The selected tab isn't kept in the URL, because the hash names the effect ([ADR 0046](0046-hash-routing.md)).
- The snippet is TSX. It calls `useReward` with a ref and fires with `reward()` from the button's click, as the preview does. Its config argument lists only the values that differ from the effect's defaults. When none differ, the argument is left out.

## Consequences
- The page follows reactbits' structure. To see the snippet change, you set the props in Preview and then open Code.
- The browser specs open the Code tab before they read the snippet.
- A snippet for `fire()` isn't shown. The README (PR 12) documents it.
