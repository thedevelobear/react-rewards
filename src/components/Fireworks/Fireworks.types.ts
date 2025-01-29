export type FireworksConfig = {
  lifetime?: number;
  angle?: number;
  decay?: number;
  spread?: number;
  startVelocity?: number;
  elementCount?: number;
  elementSize?: number;
  zIndex?: number;
  position?: string;
  colors?: string[];
  maxHeight?: number;
  fps?: number;
  onAnimationComplete?: () => void;
};
