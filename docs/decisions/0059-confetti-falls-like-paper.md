# 0059. Confetti eases into falling like paper

- **Status:** Proposed
- **Date:** 2026-10-24

- The launch is all but unchanged: pieces fly in the cone, slow with drag, spin and flip. From 0.4 s before the top of its flight to 1.6 s after it, a piece eases into its fall, on an ease-in-out cubic, so no moment shows where it starts. Where a piece is in its flight comes from its fall speed: a piece falling from rest reaches `vy` after `-ln(1 - vy / fall) / drag` seconds, and a rising piece tops out that many seconds before 0. Without drag or gravity a piece never settles.
- Settled, a piece falls somewhere between the two ways a falling plate does, gently:
  - A flutterer sways from side to side like a leaf, about 19 px each way at the defaults, rocking with the sway and slowing a little as it swings out.
  - A tumbler turns end over end with a slight wobble, and glides to one side at up to half its fall speed.
- Each piece's place between the two is random and even, as is the side it tumbles and glides to, so a burst opens evenly as it falls, about 1.3 times as wide from 1.25 s to 2.5 s.
- Each piece falls at its own speed, 0.8 to 1.2 times `gravity / drag`. The sway's speeds are shares of the piece's own fall speed, so the motion keeps its shape at any `gravity` and `drag`.
- Four slots hold it all: the sway's phase, its speed (whose size places the piece between flutterer and tumbler, and whose sign is its side), how settled the piece is, and its gravity's scale. The flip follows the sway's phase. There are no new settings.
- The sway is added at the end of each step with how settled the piece is then, and the glide uses how settled it is midway, so a burst stays within 1 px across frame rates.

**Why:** Once drag had taken the launch's speed, every piece fell straight down at the same speed, so the burst fell as a column, or as a flat-topped block. A sideways glide alone made pieces slide along straight lines, gliding to the side a piece was thrown left a gap in the middle of a big burst, and a strong swing looked like a tornado. Paper flutters and tumbles gently, and each piece falls at its own speed.

**Consequences:** Confetti settles in a slightly wider area than before, and `drag`'s description says pieces settle at about `gravity / drag`.
