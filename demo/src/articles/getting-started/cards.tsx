import { Icon } from '@/components/icon';
import { effects } from '@/data/effects';
import type { Paint } from './types';

/** Each card's icon colour, by effect. An effect not listed is `--accent`. */
const PAINTS: Readonly<Partial<Record<string, Paint>>> = {
  confetti: 'art-violet',
  emoji: 'accent',
  balloon: 'art-sky',
  firework: 'art-amber',
};

/**
 * A card per effect, linking to its page, with its icon in its colour
 * (README, "Getting started").
 */
export const EffectCards = () => (
  <ul className="effect-cards">
    {effects.map(({ name, label, description, icon }) => (
      <li key={name}>
        <a className="effect-card" href={`#${name}`}>
          <span
            className="effect-card-art"
            style={{ color: `var(--${PAINTS[name] ?? 'accent'})` }}
            aria-hidden="true"
          >
            <Icon name={icon} size={64} strokeWidth={1.5} />
          </span>
          <span className="effect-card-body">
            <span className="effect-card-text">
              <span className="effect-card-name">{label}</span>
              <span className="effect-card-description">{description}</span>
            </span>
            <Icon name="arrow-right" />
          </span>
        </a>
      </li>
    ))}
  </ul>
);
