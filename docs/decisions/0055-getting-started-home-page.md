# 0055. A Getting started page is the site's home, and holds the install command

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
[ADR 0051](0051-preview-and-code-tabs.md) put the install command in each effect's Code tab. The command installs the whole library, so every effect repeated it. The site had no home page: an empty or unknown hash showed the first effect ([ADR 0046](0046-hash-routing.md)), and the logo linked to it ([ADR 0047](0047-header-logo-png.md)).

The maintainer asked for the installation guide to move to a Getting started page.

Options considered:
- Getting started as the home page, or only as a sidebar link, with Confetti staying the default.
- On the page: the install command only; the install command and a basic `useReward` example; or those and a vanilla `fire()` example.
- In the sidebar: its own "Guides" group above "Effects", or a link above the Effects heading with no group.

## Decision
- The site has a Getting started page at `#getting-started`. It is the home page: an empty or unknown hash shows it, and the header's logo links to it. The document title is "Getting started · react-rewards".
- The page has the page title, with a one-line description, and two sections:
  - Installation: the install command with its package-manager switch and copy button, moved from the Code tab.
  - Usage: a sentence on `useReward`, the first effect's snippet with its defaults and a copy button, and a line pointing to the effects in the sidebar.
- The sidebar has two groups: "Guides", holding Getting started, then "Effects". On phones, both groups' links share the one row of pills.
- An effect's Code tab holds only its snippet.

## Consequences
- The install command is shown once. An effect's page starts with its preview, as before.
- An empty or unknown hash no longer shows Confetti, and the logo no longer links to `#confetti`. This refines ADRs 0046 and 0047.
- The sidebar's navigation is labelled "Pages", because it holds more than effects. Each group's list is labelled by its heading.
- The Guides group has room for more guides. A guide is a page of the site, not a file in `docs/guides/`.
