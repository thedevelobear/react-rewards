export type EmojiConfig = {
  lifetime?: number;
  angle?: number;
  decay?: number;
  spread?: number;
  startVelocity?: number;
  elementCount?: number;
  elementSize?: number;
  zIndex?: number;
  position?: string;
  emoji?: string[];
  rotate?: boolean;
  onAnimationComplete?: () => void;
};
