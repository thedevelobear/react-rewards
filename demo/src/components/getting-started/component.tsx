import { useId } from 'react';
import { CodeBlock } from '@/components/code-block';
import { InstallCommand } from '@/components/install-command';
import { effects, snippet } from '@/data/effects';
import './style.css';

/** The first effect's snippet, with its defaults. */
const EXAMPLE = effects[0].use((page) => snippet(page, page.effect.defaults));

/**
 * The home page's sections: the install command, which every effect
 * shares, and a first example (README, "Getting started").
 */
export const GettingStarted = () => {
  const installHeading = useId();
  const usageHeading = useId();
  return (
    <>
      <section className="section" aria-labelledby={installHeading}>
        <h2 id={installHeading} className="section-title">
          Installation
        </h2>
        <InstallCommand />
      </section>
      <section className="section" aria-labelledby={usageHeading}>
        <h2 id={usageHeading} className="section-title">
          Usage
        </h2>
        <p className="getting-started-text">
          Give <code>useReward</code> a ref to the element a reward starts from,
          and an effect. Each call to <code>reward()</code> fires a burst.
        </p>
        <CodeBlock code={EXAMPLE} label="the example" />
        <p className="getting-started-text">
          Each effect in the sidebar has a preview, its settings, and a snippet
          with the settings you pick.
        </p>
      </section>
    </>
  );
};
