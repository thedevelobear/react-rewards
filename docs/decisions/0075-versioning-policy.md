# 0075. Versions follow semver, and a built-in effect's new look is a minor release

- **Status:** Proposed
- **Date:** 2026-11-03

A release's version is the highest level among the changes since the last tag. Each change takes the highest level whose rules it matches:

- **Major:** a change that can stop code or a setup that worked with the last release:
  - removing or renaming an export, a parameter, a burst option, an effect's setting, or a member of a public type;
  - a type change that can stop code that type-checked: something optional made required, a new required parameter or option, a new required member in a type that users implement (`EffectDefinition`, `EffectConfig`), or a narrower type for what users pass in (a new value in a type the library hands back is a minor, below);
  - changing what an existing function or option does, as its article on the site documents it, such as a burst option's default, a setting's units, or when `onComplete` runs;
  - changing what custom effects rely on: what `spawn`, `update` and `animation` are given, how particles are stepped or drawn, or what a math helper returns, as [ADR 0019](0019-particle-contract.md) and [ADR 0053](0053-public-math-helpers.md) set them (a new member in a type handed to effects, such as `Particle` or `UpdateContext`, is a minor, below);
  - peer dependencies: a higher lowest React, or a new peer dependency;
  - supported environments: a browser or fallback that works today stops working, or the module format, the `exports` map or the `'use client'` banner changes so that an import that worked fails.
- **Minor:** an addition, or a deliberate change to a built-in effect:
  - a new export, such as an effect, a type or a math helper;
  - a new optional parameter, option or contract method, such as `animation` ([ADR 0073](0073-effects-animate-their-element.md)), a new setting for a built-in effect (`config` takes a `Partial`), a new member in a type the library hands to effects, such as `Particle`, or a new kind of value users may pass, such as a `SpriteSource`;
  - a new value in a type the library hands back, such as a new `BurstEnd` or a new `RendererKind` like `'webgpu'`;
  - a deliberate change to a built-in effect's look, motion or default settings, with the API unchanged;
  - deprecating something that keeps working;
  - support for more environments, such as an older React.
- **Patch:** a fix that makes the library or an effect look or behave as intended and as documented, and changes users can't see in what they get, such as a refactor or a faster engine.
- **No release:** a change outside the published package, such as the site, docs, tests, CI, the agents, or a dev dependency that leaves `dist/` unchanged. It needs no `CHANGELOG.md` entry.

A change to how an effect looks is a fix when its ADR, its page or a bug report says how it should look and it didn't. Otherwise it is a deliberate change. A change that no rule covers is the maintainer's to classify, before the release.

A release's `CHANGELOG.md` entry groups its changes under "Breaking changes", "Added", "Changed" and "Fixed", in that order, without empty sections. Deliberate changes to an effect and deprecations go under "Changed". A new value the library hands back goes under "Added", and says how to handle it, so code with an exhaustive `switch` over the old values knows to add a case. Each entry tells users what they get or must change, not which commits made it.

**Why:** People install `^3` and expect an update to keep their code working, and the version tells them what to check. A built-in effect's look is a design, not API: code that uses it still compiles and runs, so a new look is a minor that the CHANGELOG lists, not a major that sends everyone through their code. Custom effects are written against the stepping and the helpers, so a change there breaks them as surely as a renamed export. A new value the library hands back can stop an exhaustive `switch` type-checking, but it is a minor, so 3.x can add renderers and ways a burst ends.

**Consequences:** A breaking change waits for a major release, which the site explains with an upgrade article, as 3.0.0's "Upgrading from v2" does. The API report's diff since the last tag shows most API changes ([ADR 0074](0074-api-report-with-api-extractor.md)), but not behaviour, defaults, the stepping, peer dependencies or environments, which come from the commits and ADRs.
