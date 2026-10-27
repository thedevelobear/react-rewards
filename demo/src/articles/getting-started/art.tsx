/*
 * Paths from Tabler Icons (MIT, Copyright (c) 2020-2026 Paweł Kuna) and, for
 * fireworks, Hugeicons' free set (MIT, Copyright (c) 2025 Hugeicons).
 */
import { Icon } from '@/components/icon';
import type { DrawingProps, EffectArtProps, Stroke } from './types';

/** The drawings' width and height on the card, in CSS pixels. */
const SIZE = 64;

/** Every drawing's stroke, on the 24 px grid: about 4 px at `SIZE`. */
const STROKE_WIDTH = 1.5;

/** A popper in the accent, and the bits it throws in the other colours. */
const CONFETTI: readonly Stroke[] = [
  {
    d: 'M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39z',
    paint: 'accent',
  },
  { d: 'M4 5h2M5 4v2', paint: 'art-violet' },
  { d: 'M11.5 4l-.5 2', paint: 'art-amber' },
  { d: 'M18 5h2M19 4v2', paint: 'art-sky' },
  { d: 'M15 9l-1 1', paint: 'art-mint' },
  { d: 'M18 13l2 -.5', paint: 'art-violet' },
  { d: 'M18 19h2M19 18v2', paint: 'art-amber' },
];

/** Two hearts: a whole one in front, and a larger one partly behind it. */
const HEARTS: readonly Stroke[] = [
  {
    d: 'M14.017 18l-2.017 2l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 0 1 8.153 5.784',
    paint: 'art-violet',
  },
  {
    d: 'M15.99 20l4.197 -4.223a2.81 2.81 0 0 0 0 -3.948a2.747 2.747 0 0 0 -3.91 -.007l-.28 .282l-.279 -.283a2.747 2.747 0 0 0 -3.91 -.007a2.81 2.81 0 0 0 -.007 3.948l4.182 4.238z',
    paint: 'accent',
  },
];

/** A balloon with a shine on its top right, and its string. */
const BALLOON: readonly Stroke[] = [
  {
    d: 'M6 8a6 6 0 1 1 12 0c0 4.97 -2.686 9 -6 9s-6 -4.03 -6 -9',
    paint: 'art-sky',
  },
  { d: 'M14 8a2 2 0 0 0 -2 -2', paint: 'accent' },
  { d: 'M12 17v1a2 2 0 0 1 -2 2h-3a2 2 0 0 0 -2 2', paint: 'art-line' },
];

/*
 * Four curved lines bursting from (12, 11), and the sparks around them. The
 * sparks are dots, round caps on strokes of almost no length, listed
 * clockwise from the right, so neighbours alternate colours.
 */
const FIREWORK: readonly Stroke[] = [
  { d: 'M19 18C17.5 12.5 12 11 12 11C12 11 8 14.5 8 21', paint: 'accent' },
  {
    d: 'M2 10.0249C3.33333 9.01472 7.2 7.80245 12 11.0352C13.1667 9.35033 16.8 6.38511 22 8.00281',
    paint: 'accent',
  },
  {
    d: 'M15 5C14 5.66667 12 7.8 12 11C11.6667 9.33333 10 5.6 6 4',
    paint: 'accent',
  },
  {
    d: 'M6 14C6.98663 13 9.55185 11 11.9198 11C12.9064 12.1667 13.8069 14 13.3997 18',
    paint: 'accent',
  },
  { d: 'M18 11V11.01', paint: 'art-amber' },
  { d: 'M20 12V12.01', paint: 'art-sky' },
  { d: 'M13 20.4922V20.5022', paint: 'art-amber' },
  { d: 'M4 16V16.01', paint: 'art-sky' },
  { d: 'M3 3V3.01', paint: 'art-amber' },
  { d: 'M11 4V4.01', paint: 'art-sky' },
  { d: 'M17 3V3.01', paint: 'art-amber' },
];

const DRAWINGS: Readonly<Record<string, readonly Stroke[]>> = {
  confetti: CONFETTI,
  emoji: HEARTS,
  balloon: BALLOON,
  firework: FIREWORK,
};

/** A line drawing on a 24 px grid, each stroke in its own colour. */
const Drawing = ({ strokes }: DrawingProps) => (
  <svg
    width={SIZE}
    height={SIZE}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth={STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {strokes.map(({ d, paint }) => (
      <path key={d} d={d} style={{ stroke: `var(--${paint})` }} />
    ))}
  </svg>
);

/**
 * A drawing of the effect for its card. An effect without one shows its
 * icon, at the same size and stroke (README, "Getting started").
 */
export const EffectArt = ({ name, icon }: EffectArtProps) => {
  const strokes = DRAWINGS[name];
  return strokes ? (
    <Drawing strokes={strokes} />
  ) : (
    <Icon name={icon} size={SIZE} strokeWidth={STROKE_WIDTH} />
  );
};
