import type { EffectConfig } from 'react-rewards';
import type { EffectPage } from './types';
import { fields, formatValue, isStringList, quote, sameValue } from './util';

/** The snippet's line width, as in the repo's Biome config. */
const WIDTH = 80;

/** One property of the config argument. A long list gets a line per item. */
const property = (key: string, value: unknown) => {
  const line = `    ${key}: ${formatValue(value)},`;
  if (line.length <= WIDTH || !isStringList(value)) return line;
  const items = value.map((item) => `      ${quote(item)},`);
  return [`    ${key}: [`, ...items, '    ],'].join('\n');
};

/**
 * A component that fires the effect with `config`, as the preview does. The
 * config argument has only the values that differ from the effect's
 * defaults, and is left out when none do (ADR 0051).
 */
export const snippet = <C extends EffectConfig>(
  page: EffectPage<C>,
  config: Readonly<C>
): string => {
  const { name } = page.effect;
  const changed = fields(page, config).filter(
    ({ value, defaultValue }) => !sameValue(value, defaultValue)
  );
  const args =
    changed.length === 0
      ? `ref, ${name}`
      : [
          `ref, ${name}, {`,
          ...changed.map(({ key, value }) => property(key, value)),
          '  }',
        ].join('\n');
  const imports = [name, 'useReward'].sort().join(', ');

  return `import { useRef } from 'react';
import { ${imports} } from 'react-rewards';

export const RewardButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward } = useReward(${args});

  return (
    <button ref={ref} type="button" onClick={() => reward()}>
      Reward me
    </button>
  );
};
`;
};
