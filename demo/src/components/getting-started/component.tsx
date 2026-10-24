import { useId } from 'react';
import { CodeBlock } from '@/components/code-block';
import { InstallCommand } from '@/components/install-command';
import { Preview } from '@/components/preview';
import { effects, snippet } from '@/data/effects';
import { EffectCards } from './cards';
import type { StepProps } from './types';
import './style.css';

/** The first effect's snippet, with its defaults. */
const EXAMPLE = effects[0].use((page) => snippet(page, page.effect.defaults));

/** A numbered step, joined to the next by a line. */
const Step = ({ number, title, text, children }: StepProps) => {
  const heading = useId();
  return (
    <section className="step" aria-labelledby={heading}>
      <div className="step-rail" aria-hidden="true">
        <span className="step-number">{number}</span>
      </div>
      <div className="step-body">
        <h2 id={heading} className="section-title step-title">
          {title}
        </h2>
        <p className="step-text">{text}</p>
        {children}
      </div>
    </section>
  );
};

/**
 * The home page: a preview of the first effect, then three steps: the
 * install command, which every effect shares, a first example, and the
 * effects (README, "Getting started").
 */
export const GettingStarted = () => (
  <>
    {effects[0].use((page) => (
      <Preview
        page={page}
        config={page.effect.defaults}
        caption="Every call to reward() fires a new burst."
      />
    ))}
    <div className="steps">
      <Step
        number={1}
        title="Install the package"
        text="Add react-rewards with the package manager you already use."
      >
        <InstallCommand />
      </Step>
      <Step
        number={2}
        title="Fire your first reward"
        text={
          <>
            Give <code>useReward</code> a ref to the element a reward starts
            from, and an effect. Each call to <code>reward()</code> fires a
            burst.
          </>
        }
      >
        <CodeBlock
          code={EXAMPLE}
          filename="RewardButton.tsx"
          label="the example"
        />
      </Step>
      <Step
        number={3}
        title="Pick an effect"
        text="Each effect has a preview, its settings, and a snippet with the settings you pick."
      >
        <EffectCards />
      </Step>
    </div>
  </>
);
