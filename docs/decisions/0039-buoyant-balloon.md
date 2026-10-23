# 0039. Balloons are redesigned, and rise by negative gravity

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
v2's balloons rise at about 90 px/s in a 50° cone, with almost no slowing (a decay of 0.999 per frame) and no gravity. They rock by up to 19° every 4 s or so, shrink to 80%, drift sideways by up to 60 px, and fade over the second half of a 10 s life. The balloon is an SVG whose fill is `currentColor`, coloured through CSS. The new engine has no tint, so colour is baked into sprites (plan step 1c).

[ADR 0024](0024-physical-config-units.md) says `gravity` points down. Options considered: re-create v2's motion in physical units, or redesign the balloons so they float up by buoyancy, written as a negative `gravity`.

## Decision
- The config is `count`, `size` (the width in CSS pixels), `colors`, `angle`, `spread`, `velocity`, `drag`, `gravity` and `lifetime`. A sprite is `size` wide and `size * 3040 / 976` tall, string included, which is v2's SVG's shape.
- Each colour is one sprite: v2's `balloon.svg` with `currentColor` replaced by the colour. A balloon picks one at random.
- A balloon launches at `angle` plus or minus half of `spread`, at 0.5 to 1.5 times `velocity`, and `drag` slows the launch.
- A negative `gravity` points up, so it works as buoyancy: a balloon settles at a rise speed of `-gravity / drag`. Each balloon's gravity is scaled by 0.8 to 1.2, so the balloons spread out as they rise.
- A balloon sways side to side around its path, by up to `size` pixels at 1 to 2 rad/s. It tilts with the sway's velocity, by up to 0.2 rad, so the string trails behind.
- Its scale is 0.9 to 1.1.
- It is fully opaque until the last 20% of its life, then fades out. Each balloon lives 85 to 100% of `lifetime`, so the burst still ends by `lifetime`.
- Defaults: `count` 10, `size` 20, v2's five colours (`#A45BF1`, `#25C6F6`, `#72F753`, `#F76C88`, `#F5F770`), `angle` 90, `spread` 60, `velocity` 600, `drag` 2, `gravity` -300, `lifetime` 5000.
- Balloons can't be clicked or popped ([ADR 0005](0005-effect-contract-scope.md)).

## Consequences
- At the defaults, balloons rise at about 150 px/s after the launch (v2: about 90 px/s), and most leave a typical viewport before they fade.
- `gravity` keeps one meaning across effects. A positive value makes balloons fall, and the demo's sliders (PR 10) need a range that goes below zero for balloons.
- The README's "from v2" table (PR 12) lists the change of look and the loss of click-to-pop.
- The numbers are tuned by eye in `demo/`. Changing them later changes the look, not the contract.
