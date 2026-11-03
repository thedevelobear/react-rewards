# 0075. Versions follow semver, and a built-in effect's new look is a minor release

- **Status:** Proposed
- **Date:** 2026-11-03

A release's version is the highest level among the changes since the last tag. Each change takes the highest level whose rules it matches:

- **Major:** a change that can stop code or a setup that worked with the last release:
  - removing or renaming an export, a parameter, a burst option, an effect's setting, or a member of a public type;
  - a type change that can stop code that type-checked: something optional made required, a new required parameter or option, a new required member in a type that users create (`EffectDefinition`, `EffectConfig`), or a narrower type for what users pass in (a new value in a type users only receive is a minor, and a fix to a wrong type is a patch, both below);
  - changing what an existing function or option does, as its article on the site documents it, such as a burst option's default, a setting's units, or the condition on which `onComplete` runs: once, when the burst ends on its own. How soon that is isn't the condition, so a new default `lifetime` isn't a major. A built-in effect's default settings aren't burst options, and changing them is the minor below;
  - changing what custom effects rely on: what `spawn`, `update` and `animation` are given, how particles are stepped or drawn, or what a math helper returns, as [ADR 0019](0019-particle-contract.md) and [ADR 0053](0053-public-math-helpers.md) set them (a new member in a type users only receive, such as `Particle` or `UpdateContext`, is a minor, below);
  - peer dependencies: a higher lowest React, or a new peer dependency;
  - supported environments: dropping a supported browser or the Canvas 2D fallback; a change to the module format, the `exports` map or the `'use client'` banner that makes an import that worked fail; or importing the package on the server failing, where the site's Server rendering page says it can be imported, since nothing touches `window` until a burst fires.
- **Minor:** an addition, or a deliberate change to a built-in effect:
  - a new export, such as an effect, a type or a math helper;
  - a new optional parameter, option or contract method, such as `animation` ([ADR 0073](0073-effects-animate-their-element.md)), a new setting for a built-in effect (`config` takes a `Partial`), or a new kind of value users may pass, such as a `SpriteSource`;
  - a new member or value in a type users only receive, such as a new member of `Burst` or `Particle`, a new `BurstEnd`, or a new `RendererKind` like `'webgpu'`;
  - a deliberate change to a built-in effect's look, motion or default settings, with the API unchanged;
  - a deprecation, as below;
  - support for more environments, such as an older React or browser.
- **Patch:**
  - a fix that makes the library or an effect look or behave as intended and as documented;
  - a fix to a public type that doesn't match what the code does or what the site documents. It is a patch even when it rejects code that used to type-check, as long as that code couldn't have worked. When users rely on the wrong type, the maintainer classifies the change;
  - a change users can't see in what they get, such as a refactor or a faster engine.
- **No release:** a change outside the published package, such as the site, docs, tests, CI, the agents, or a dev dependency that leaves `dist/` unchanged. It needs no `CHANGELOG.md` entry.

A change to how an effect looks is a fix when its ADR, its page or a bug report says how it should look and it didn't. Otherwise it is a deliberate change. A change that no rule covers is the maintainer's to classify, before the release.

**Types users create or receive.** Each public type's JSDoc says whether users create it, such as `EffectDefinition`, `EffectConfig`, `SpriteSource`, `ElementAnimation` and the options, or only receive it, such as `Burst`, `Particle`, `UpdateContext`, `BurstEnd` and `RendererKind`. A type users create gains only optional members, or new kinds, in a minor. A type users only receive may gain members or values in a minor, and `BurstEnd` and `RendererKind` say that a `switch` over them needs a `default` case.

**Deprecations.** Before a major removes or renames an export, option, setting or member that has a replacement, a minor deprecates it. Its JSDoc gets `@deprecated`, naming the replacement, its article on the site says it is deprecated, and the CHANGELOG lists it. It keeps working until the next major, whose upgrade article lists each removal. There are no console warnings.

**Supported environments.**
- React 18 and every later major (`react >=18`). A new React major needs a release only if it needs a code change, which takes that change's level. The tests run on the lowest supported React as well as the newest ([ADR 0080](0080-unit-tests-on-react-18.md)).
- Chrome and Edge 87, Firefox 79, and Safari 14.1 (iOS 14.5), and later ([ADR 0079](0079-build-targets-the-supported-browsers.md)). Bursts draw with WebGL2 where it is available, and with Canvas 2D elsewhere.

**Releases and old majors.** Releases go to npm's `latest` only, and there are no pre-releases ([ADR 0054](0054-publish-from-github-release.md)). Only the latest major gets fixes. A security fix may be backported to the previous major, at the maintainer's discretion, from a `vN.x` branch to the npm dist-tag `vN-latest`.

A release's `CHANGELOG.md` entry groups its changes under "Breaking changes", "Added", "Changed", "Deprecated" and "Fixed", in that order, without empty sections. Each entry tells users what they get or must change, not which commits made it:
- A new value in a type users only receive goes under "Added", and says how to handle it, so code with an exhaustive `switch` over the old values knows to add a case.
- A deliberate change to a built-in effect goes under "Changed". A change to its default settings gives the old values, so users can pass them to keep the old look.
- A deprecation goes under "Deprecated", with its replacement.

**Why:** People install `^3` and expect an update to keep their code working, and the version tells them what to check. A built-in effect's look is a design, not API: code that uses it still compiles and runs, so a new look is a minor that the CHANGELOG lists, with the old values to keep it, not a major that sends everyone through their code. Custom effects are written against the stepping and the helpers, so a change there breaks them as surely as a renamed export. Saying in each type which ones users only receive is what lets those types grow in a minor: a new value can stop an exhaustive `switch` type-checking, but the JSDoc asks for a `default` case, so 3.x can add renderers and ways a burst ends. A deprecation a minor ahead gives users a release in which the old and new APIs both work.

**Consequences:** A breaking change waits for a major release, which the site explains with an upgrade article, as 3.0.0's "Upgrading from v2" does. The API report's diff since the last tag shows most API changes ([ADR 0074](0074-api-report-with-api-extractor.md)), deprecations included, since it marks each `@deprecated` member, but not behaviour, defaults, the stepping, peer dependencies or environments, which come from the commits and ADRs. The publish workflow passes no `--tag`, and npm 11 won't put a version below the current `latest` on `latest`, so the first backport needs the workflow to publish with `--tag vN-latest`.
