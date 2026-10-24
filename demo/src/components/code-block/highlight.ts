import type { HighlighterCore, ThemeRegistration } from 'shiki/core';

/** The theme's name, for `codeToTokens`. */
export const THEME = 'site';

/** A colour of the site's theme: a `--code-*` token in `tokens.css`. */
const color = (name: string) => ({ foreground: `var(--code-${name})` });

/**
 * The site's theme. Its colours are the `--code-*` tokens, so the code
 * follows the site's theme with no script. A deeper scope wins, so `=>` and
 * the quotes of a string override `storage` and `punctuation` (README, "Code
 * colours").
 */
const theme: ThemeRegistration = {
  name: THEME,
  type: 'dark',
  fg: 'var(--code-foreground)',
  bg: 'var(--code-background)',
  settings: [
    {
      scope: [
        'keyword',
        'storage',
        'constant.language',
        'constant.numeric',
        'variable.language',
      ],
      settings: color('keyword'),
    },
    {
      scope: [
        'punctuation',
        'meta.brace',
        'keyword.operator',
        'storage.type.function.arrow',
        'comment',
      ],
      settings: color('punctuation'),
    },
    {
      scope: ['string', 'punctuation.definition.string'],
      settings: color('string'),
    },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: color('function'),
    },
    {
      scope: [
        'entity.name.type',
        'support.type',
        'entity.other.inherited-class',
        'entity.other.attribute-name',
      ],
      settings: color('type'),
    },
    {
      scope: ['entity.name.tag', 'support.class.component'],
      settings: color('tag'),
    },
  ],
};

let loaded: HighlighterCore | null = null;
let loading: Promise<HighlighterCore> | null = null;

/** The highlighter, if it has loaded. */
export const highlighter = (): HighlighterCore | null => loaded;

/**
 * Loads shiki once, after the first paint, with the JavaScript regex engine
 * and the tsx grammar only (README, "Code colours").
 */
export const loadHighlighter = (): Promise<HighlighterCore> => {
  loading ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ]).then(
    async ([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) => {
      loaded = await createHighlighterCore({
        themes: [theme],
        langs: [import('shiki/langs/tsx.mjs')],
        engine: createJavaScriptRegexEngine(),
      });
      return loaded;
    }
  );
  return loading;
};
