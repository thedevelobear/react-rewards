import type { HighlighterCore } from 'shiki/core';

/**
 * The theme's colours are the `--code-*` tokens in `tokens.css` (README,
 * "Code colours").
 */
export const THEME = 'site';

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
    async ([
      { createCssVariablesTheme, createHighlighterCore },
      { createJavaScriptRegexEngine },
    ]) => {
      loaded = await createHighlighterCore({
        themes: [
          createCssVariablesTheme({ name: THEME, variablePrefix: '--code-' }),
        ],
        langs: [import('shiki/langs/tsx.mjs')],
        engine: createJavaScriptRegexEngine(),
      });
      return loaded;
    }
  );
  return loading;
};
