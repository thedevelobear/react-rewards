import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icon';

/** A colour of the drawings: a token in `tokens.css`. */
type Paint = 'accent' | 'art-violet' | 'art-amber' | 'art-sky' | 'art-mint';

const fill = (paint: Paint): CSSProperties => ({ fill: `var(--${paint})` });

/** A confetti piece: where it sits in the card, in %, and its shape. */
interface Piece {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly paint: Paint;
  readonly round?: boolean;
  readonly turn?: number;
}

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

/** A face's parts, turned and placed at `x` and `y`. */
const Face = ({
  x,
  y,
  turn,
  children,
}: {
  readonly x: number;
  readonly y: number;
  readonly turn: number;
  readonly children: ReactNode;
}) => <g transform={`translate(${x} ${y}) rotate(${turn})`}>{children}</g>;

/** Three faces. Their features are `--ink` in both themes. */
const Emoji = () => (
  <svg
    className="effect-art-ink"
    width="150"
    height="80"
    viewBox="0 0 150 80"
    aria-hidden="true"
  >
    <Face x={28} y={46} turn={-14}>
      <circle r="17" style={fill('art-amber')} />
      <circle cx="-6" cy="-4" r="2.2" />
      <circle cx="6" cy="-4" r="2.2" />
      <path className="effect-art-smile" d="M-8 4a9 9 0 0 0 16 0" />
    </Face>
    <Face x={76} y={32} turn={6}>
      <circle r="21" style={fill('accent')} />
      <path className="effect-art-smile" d="M-11 -6l5 3M11 -6l-5 3" />
      <path d="M-10 5a10 10 0 0 0 20 0Z" />
    </Face>
    <Face x={122} y={50} turn={16}>
      <circle r="15" style={fill('art-violet')} />
      <circle cx="-5" cy="-3" r="2" />
      <circle cx="5" cy="-3" r="2" />
      <path className="effect-art-smile" d="M-6 4a7 7 0 0 0 12 0" />
    </Face>
  </svg>
);

/** A balloon at `x`, its top at `y`, with its knot and its shine. */
const Balloon = ({
  x,
  y,
  width,
  height,
  paint,
}: {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly paint: Paint;
}) => (
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
  emoji: Emoji,
  balloon: Balloons,
};

/**
 * A drawing of the effect for its card. An effect without one shows its
 * icon (README, "Getting started").
 */
export const EffectArt = ({
  name,
  icon,
}: {
  readonly name: string;
  readonly icon: IconName;
}) => {
  const Art = ART[name];
  return Art ? <Art /> : <Icon name={icon} size={32} strokeWidth={1.5} />;
};
