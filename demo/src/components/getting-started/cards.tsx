import { Icon } from '@/components/icon';
import { effects } from '@/data/effects';
import { EffectArt } from './art';

/** A card per effect, linking to its page (README, "Getting started"). */
export const EffectCards = () => (
  <ul className="effect-cards">
    {effects.map(({ name, label, description, icon }) => (
      <li key={name}>
        <a className="effect-card" href={`#${name}`}>
          <span className="effect-card-art" aria-hidden="true">
            <EffectArt name={name} icon={icon} />
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
