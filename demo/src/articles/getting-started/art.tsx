import type { ComponentType, CSSProperties } from 'react';
import { Icon } from '@/components/icon';
import type {
  BalloonProps,
  EffectArtProps,
  HeartProps,
  Paint,
  Piece,
} from './types';

const fill = (paint: Paint): CSSProperties => ({ fill: `var(--${paint})` });

const stroke = (paint: Paint): CSSProperties => ({
  stroke: `var(--${paint})`,
});

const PIECES: readonly Piece[] = [
  { left: 22, top: 30, width: 8, height: 14, paint: 'accent', turn: -24 },
  { left: 38, top: 18, width: 9, height: 9, paint: 'art-violet', round: true },
  { left: 52, top: 40, width: 5, height: 16, paint: 'art-amber', turn: 32 },
  { left: 66, top: 22, width: 8, height: 12, paint: 'art-sky', turn: 12 },
  { left: 76, top: 52, width: 8, height: 8, paint: 'art-mint', round: true },
  { left: 30, top: 62, width: 5, height: 14, paint: 'art-sky', turn: -48 },
  { left: 46, top: 70, width: 8, height: 12, paint: 'accent', turn: 64 },
  { left: 62, top: 68, width: 7, height: 7, paint: 'art-amber', round: true },
  { left: 14, top: 54, width: 7, height: 7, paint: 'art-violet', round: true },
];

/** Pieces scattered across the card, so they spread with its width. */
const Confetti = () =>
  PIECES.map((piece) => (
    <span
      key={`${piece.left} ${piece.top}`}
      className="effect-art-piece"
      style={{
        left: `${piece.left}%`,
        top: `${piece.top}%`,
        width: piece.width,
        height: piece.height,
        borderRadius: piece.round ? '50%' : 2,
        background: `var(--${piece.paint})`,
        transform: piece.turn ? `rotate(${piece.turn}deg)` : undefined,
      }}
    />
  ));

/**
 * A heart centred on (0, 0), 17.6 by 15.5: the shape of the emoji page's
 * icon (`heart` in `ICON_PATHS`).
 */
const HEART =
  'M0 7.75-7.4.35a4.75 4.75 0 0 1 6.72-6.72l.68.68.68-.68a4.75 4.75 0 0 1 6.72 6.72Z';

/** A heart at `x` and `y`, turned and scaled, with a shine on its left lobe. */
const Heart = ({ x, y, turn, scale, paint }: HeartProps) => (
  <g
    transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}
    style={fill(paint)}
  >
    <path d={HEART} />
  </g>
);

/** Three hearts, where the emoji fly. */
const Hearts = () => (
  <svg width="150" height="80" viewBox="0 0 150 80" aria-hidden="true">
    <Heart x={28} y={46} turn={-14} scale={2} paint="art-amber" />
    <Heart x={76} y={32} turn={6} scale={2.4} paint="accent" />
    <Heart x={122} y={50} turn={16} scale={1.8} paint="art-violet" />
  </svg>
);

/** A balloon at `x`, its top at `y`, with its knot and its shine. */
const Balloon = ({ x, y, width, height, paint }: BalloonProps) => (
  <g style={fill(paint)}>
    <ellipse cx={x} cy={y + height} rx={width} ry={height} />
    <path d={`M${x - 3} ${y + height * 2}h6l-3 4Z`} />
    <ellipse
      className="effect-art-shine"
      cx={x - width / 3}
      cy={y + height * 0.65}
      rx={width / 4}
      ry={height / 3}
    />
  </g>
);

const Balloons = () => (
  <svg width="150" height="96" viewBox="0 0 150 96" aria-hidden="true">
    <g className="effect-art-string" fill="none" strokeWidth="1.5">
      <path d="M40 52c0 10 -6 14 -3 24s-4 14 -2 20" />
      <path d="M76 44c0 12 5 16 2 26s3 14 1 26" />
      <path d="M112 56c0 10 -4 14 -1 22s-3 12 -2 18" />
    </g>
    <Balloon x={40} y={13} width={15} height={19} paint="art-sky" />
    <Balloon x={76} y={2} width={17} height={21} paint="accent" />
    <Balloon x={112} y={19} width={14} height={18} paint="art-mint" />
  </svg>
);

/*
 * The fireworks' shapes, in a 170 by 120 box. Dots are round caps on strokes
 * of no length (`h0`). The trails start below the box, so they rise from one
 * point under the card.
 */
const TRAILS = [
  'M80 124Q77.8 116.2 70.8 112T61.6 100T52.4 88T43.2 76T34 64',
  'M85 124Q88.2 117.1 85.5 110T86 96T86.5 82T87 68T87.5 54T88 40',
  'M90 124Q96.9 121.1 99.4 114T108.8 104T118.2 94T127.6 84T137 74',
];
/** A willow's strands, which rise from the burst and droop, and their stars. */
const WILLOW_STRANDS =
  'M86 26Q79 6 75 40M84.5 28Q69 13 66 47M84 31Q65 26 61 54M90 26Q97 6 101 40M91.5 28Q107 13 110 47M92 31Q111 26 115 54';
const WILLOW_STARS = 'M75 40h0M66 47h0M61 54h0M101 40h0M110 47h0M115 54h0';
/** Where a crackle's stars popped, and the sparks around each. */
const CRACKLE_POPS =
  'M140 34h0M154 42h0M155 58h0M142 66h0M127 59h0M125 43h0M139 50h0';
const CRACKLE_SPARKS = [
  'M143 32h0M137.5 31.5h0M142 37h0',
  'M157.4 43.1h0M154.4 38.5h0M150.6 40.9h0',
  'M156.3 61.4h0M151.6 59.3h0M153.7 54.6h0',
  'M145.3 67.2h0M138.9 64.1h0M143.9 62.9h0',
  'M123.4 59.5h0M128.1 62.3h0M126.5 55.4h0M130.6 58.5h0',
  'M122.4 40.5h0M123.1 46h0M127.5 40.4h0',
  'M139.4 46.4h0M135.5 50.3h0M138.6 53.6h0',
];

/**
 * Three rockets' gold trails, ending in a peony's ring of stars, a willow's
 * drooping gold strands and a crackle's glitter.
 */
const Fireworks = () => (
  <svg
    width="170"
    height="120"
    viewBox="0 0 170 120"
    fill="none"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <g style={stroke('art-amber')} strokeWidth="1.8" strokeDasharray="0 4">
      {TRAILS.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    {/* Twelve dots: the dash pattern repeats once per twelfth of the ring. */}
    <circle
      cx="32"
      cy="44"
      r="14"
      pathLength={12}
      style={stroke('accent')}
      strokeWidth="4"
      strokeDasharray="0 1"
    />
    <g style={stroke('art-amber')}>
      <path d={WILLOW_STRANDS} strokeWidth="1.3" />
      <path d={WILLOW_STARS} strokeWidth="3.2" />
    </g>
    <g style={stroke('art-sky')}>
      <path d={CRACKLE_POPS} strokeWidth="2.8" />
      {CRACKLE_SPARKS.map((d) => (
        <path key={d} d={d} strokeWidth="1.8" />
      ))}
    </g>
  </svg>
);

const ART: Readonly<Record<string, ComponentType>> = {
  confetti: Confetti,
  emoji: Hearts,
  balloon: Balloons,
  firework: Fireworks,
};

/**
 * A drawing of the effect for its card. An effect without one shows its
 * icon (README, "Getting started").
 */
export const EffectArt = ({ name, icon }: EffectArtProps) => {
  const Art = ART[name];
  return Art ? <Art /> : <Icon name={icon} size={32} strokeWidth={1.5} />;
};
