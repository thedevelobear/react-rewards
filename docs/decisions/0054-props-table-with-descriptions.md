# 0054. The props table lists the effect's config, with descriptions

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Step 3 of the plan puts a props table at the bottom of the page, with a name, a type and a default for each prop. It doesn't say which props: the effect's config, or also the burst options the hook takes as its fourth argument ([ADR 0041](0041-hook-burst-options-argument.md)). The config fields have one-line JSDoc descriptions in `src/effects/<name>/types.ts`.

Options considered:
- The config, with name, type, default and the JSDoc description.
- The same, plus a second table for the burst options (`zIndex`, `onComplete`, `respectReducedMotion` and `seed`).
- The config with name, type and default only.

## Decision
- The props table lists every field of the effect's config, in the props panel's order, with four columns: prop, type, default and description.
- The type is `number`, `boolean` or `string[]`, taken from the field's control in the effect's demo file. The default is read from `effect.defaults` and written as in the snippet.
- The description is the field's JSDoc from `src/effects/<name>/types.ts`, copied into the effect's demo file next to its control. References to ADRs are left out. Text in backticks shows as code.
- The burst options aren't listed. The README (PR 12) documents them.

## Consequences
- The site explains each setting and its unit without a trip to the types.
- The descriptions are copies, and nothing checks that they match the JSDoc. A change to a config field's JSDoc must be copied into its demo file.
- On phones, the table scrolls sideways inside its frame, so the page itself doesn't.
