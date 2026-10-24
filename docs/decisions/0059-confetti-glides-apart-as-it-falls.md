# 0059. Confetti glides apart once it has fallen a while

- **Status:** Proposed
- **Date:** 2026-10-24

- Once a piece has been falling for a while, it glides sideways, so the burst opens instead of falling in a column. The rise and the start of the fall are unchanged.
- The glide is a sideways pull of up to 0.6 × `|gravity|`, so at the defaults the fastest pieces drift 180 px/s while falling at 300 px/s. It eases in as the piece's fall speed goes from 75% to 95% of `gravity / drag`, which at a drag of 3 is from about 0.5 s to 1 s after the top of its flight. Without drag or gravity a piece never settles, so it never glides.
- A piece glides away from the cone's centre line, to the side it launched on. Up the middle, or in a sideways cone, it picks a side at random.
- There is no setting for it. The glide's side and strength ride on the flutter's speed in slot `s1`, its sign and size, as all four slots are taken.
- The glide uses the mean of the step's start and end fall speeds, and stays within 1 px across frame rates.

**Why:** With a drag of 3, the launch's sideways speed is gone within a second, so every piece fell straight down at the same speed, and the burst fell as a column. Paper drifts as it falls.

**Consequences:** Confetti settles in a wider area than before. The flutter's turn now follows the launch side instead of a coin flip, which changed the effect's snapshot.
