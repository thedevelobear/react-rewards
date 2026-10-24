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

const ART: Readonly<Record<string, ComponentType>> = {
  confetti: Confetti,
  emoji: Hearts,
  balloon: Balloons,
};

/**
 * A drawing of the effect for its card. An effect without one shows its
 * icon (README, "Getting started").
 */
export const EffectArt = ({ name, icon }: EffectArtProps) => {
  const Art = ART[name];
  return Art ? <Art /> : <Icon name={icon} size={32} strokeWidth={1.5} />;
};
