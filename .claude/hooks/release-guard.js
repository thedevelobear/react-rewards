// A PreToolUse hook on Bash (ADR 0078). It reads the tool call as JSON on
// stdin and blocks, with exit code 2 and the reason on stderr, the steps
// only the maintainer takes: pushing, creating or deleting tags, publishing
// a GitHub release, and publishing to npm. Everything else goes through.
// `permissions.deny` in .claude/settings.json blocks the plain forms too.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const PUSH = "agents don't push. The maintainer pushes branches.";
const PR_PUSH =
  "`gh pr create` without `--head` can push the branch, and agents don't push. Once the maintainer has pushed it, pass `--head`.";
const TAG =
  "agents don't create or delete tags. Publishing a GitHub release creates its tag, and the maintainer publishes.";
const RELEASE =
  'agents create GitHub releases only as drafts, with `gh release create --draft`. The maintainer publishes them.';
const PUBLISH = 'only the maintainer publishes a GitHub release.';
const REFS =
  "agents don't write branches or tags on GitHub. The maintainer pushes, and publishing a release creates its tag.";
const NPM =
  "agents don't publish to npm. The publish workflow does, when the maintainer publishes a GitHub release.";

// Words that start a command without being it.
const KEYWORDS = new Set([
  '!',
  '{',
  '}',
  'do',
  'elif',
  'else',
  'if',
  'then',
  'time',
  'until',
  'while',
]);
const WRAPPERS = new Set([
  'builtin',
  'command',
  'env',
  'exec',
  'nice',
  'nohup',
  'sudo',
  'timeout',
  'xargs',
]);
const SHELLS = new Set(['bash', 'dash', 'sh', 'zsh']);
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const FALSE = /^(0|f|false)$/i;
const TRUE = /^(1|t|true)$/i;

/** Finds the end of `$(…)` or `` `…` `` at `start`: [inner text, next index]. */
const substitution = (text, start) => {
  if (text[start] === '`') {
    const end = text.indexOf('`', start + 1);
    const stop = end === -1 ? text.length : end;
    return [text.slice(start + 1, stop), stop + 1];
  }
  let depth = 1;
  let quote = null;
  for (let i = start + 2; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) {
        quote = null;
      }
    } else if (c === "'" || c === '"') {
      quote = c;
    } else if (c === '(') {
      depth++;
    } else if (c === ')' && --depth === 0) {
      return [text.slice(start + 2, i), i + 1];
    }
  }
  return [text.slice(start + 2), text.length];
};

/**
 * Splits a shell command into simple commands, each a list of words, with
 * quotes removed. Command substitutions become commands of their own, and
 * comments and here-document bodies are left out.
 */
const parse = (text) => {
  const commands = [];
  const heredocs = [];
  let words = [];
  let word = '';
  let inWord = false;
  const endWord = () => {
    if (inWord) {
      words.push(word);
    }
    word = '';
    inWord = false;
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) {
      commands.push(words);
    }
    words = [];
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "'") {
      const end = text.indexOf("'", i + 1);
      const stop = end === -1 ? text.length : end;
      word += text.slice(i + 1, stop);
      inWord = true;
      i = stop + 1;
    } else if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') {
        if (text[j] === '\\') {
          word += text[j + 1] === '\n' ? '' : (text[j + 1] ?? '');
          j += 2;
        } else if (text[j] === '`' || text.startsWith('$(', j)) {
          const [inner, next] = substitution(text, j);
          commands.push(...parse(inner));
          j = next;
        } else {
          word += text[j];
          j++;
        }
      }
      inWord = true;
      i = j + 1;
    } else if (c === '\\') {
      // A backslash before a newline continues the line.
      if (text[i + 1] !== '\n') {
        word += text[i + 1] ?? '';
        inWord = true;
      }
      i += 2;
    } else if (c === '`' || text.startsWith('$(', i)) {
      const [inner, next] = substitution(text, i);
      commands.push(...parse(inner));
      inWord = true;
      i = next;
    } else if (c === '#' && !inWord) {
      const end = text.indexOf('\n', i);
      i = end === -1 ? text.length : end;
    } else if (text.startsWith('<<', i) && !text.startsWith('<<<', i)) {
      // A here-document: its delimiter follows, and its body starts on the
      // next line. A body fed to a shell is a script, and is checked too.
      endWord();
      const match = /^<<-?\s*(['"]?)([^\s'";&|<>()]+)\1/.exec(text.slice(i));
      if (match) {
        heredocs.push({ delimiter: match[2], reader: words });
        i += match[0].length;
      } else {
        i += 2;
      }
    } else if (c === '\n') {
      endCommand();
      i++;
      while (heredocs.length > 0) {
        const { delimiter, reader } = heredocs.shift();
        const body = [];
        while (i < text.length) {
          const end = text.indexOf('\n', i);
          const line = text.slice(i, end === -1 ? text.length : end);
          i = end === -1 ? text.length : end + 1;
          if (line.trim() === delimiter) {
            break;
          }
          body.push(line);
        }
        if (SHELLS.has(basename(unwrap(reader)[0] ?? ''))) {
          commands.push(...parse(body.join('\n')));
        }
      }
    } else if (';&|()'.includes(c)) {
      endCommand();
      i++;
    } else if (/\s/.test(c)) {
      endWord();
      i++;
    } else {
      word += c;
      inWord = true;
      i++;
    }
  }
  endCommand();
  return commands;
};

/** Strips keywords, variable assignments and wrappers such as `env`. */
const unwrap = (words) => {
  let i = 0;
  while (i < words.length) {
    if (KEYWORDS.has(words[i]) || ASSIGNMENT.test(words[i])) {
      i++;
    } else if (WRAPPERS.has(basename(words[i]))) {
      i++;
      while (
        i < words.length &&
        (words[i].startsWith('-') ||
          ASSIGNMENT.test(words[i]) ||
          /^\d+(\.\d+)?[smhd]?$/.test(words[i]))
      ) {
        i++;
      }
    } else {
      break;
    }
  }
  return words.slice(i);
};

/** A pflag boolean's last setting in `args`, or undefined if it isn't set. */
const flag = (args, long, short = '', valued = '') => {
  let state;
  for (const arg of args) {
    if (arg === '--') {
      break;
    }
    if (arg === `--${long}`) {
      state = true;
    } else if (arg.startsWith(`--${long}=`)) {
      const value = arg.slice(long.length + 3);
      state = TRUE.test(value) ? true : FALSE.test(value) ? false : state;
    } else if (short && /^-[^-]/.test(arg)) {
      for (const letter of arg.slice(1)) {
        if (letter === short) {
          state = true;
          break;
        }
        if (valued.includes(letter)) {
          break;
        }
      }
    }
  }
  return state;
};

const GIT_VALUE_OPTIONS = new Set([
  '-C',
  '-c',
  '--config-env',
  '--git-dir',
  '--namespace',
  '--super-prefix',
  '--work-tree',
]);
const TAG_WRITES =
  /^--(annotate|cleanup|create-reflog|delete|edit|file|force|local-user|message|no-sign|sign|trailer)(=|$)/;
const TAG_LISTS =
  /^--(color|column|contains|format|ignore-case|list|merged|no-color|no-column|no-contains|no-merged|omit-empty|points-at|sort|verify)(=|$)/;

const TAG_LIST_VALUES = new Set([
  '--contains',
  '--format',
  '--merged',
  '--no-contains',
  '--no-merged',
  '--points-at',
  '--sort',
]);

/** Whether `git tag` with these arguments creates or deletes a tag. */
const writesTag = (all) => {
  // The values of list options, such as `--sort -v:refname`, aren't options.
  const args = all.filter((_, i) => !TAG_LIST_VALUES.has(all[i - 1]));
  const short = args.filter((arg) => /^-[^-]/.test(arg));
  if (
    args.some((arg) => TAG_WRITES.test(arg)) ||
    short.some((arg) => /[adefmsuF]/.test(arg.slice(1)))
  ) {
    return true;
  }
  const lists =
    args.some((arg) => TAG_LISTS.test(arg)) ||
    short.some((arg) => /[ilnv]/.test(arg.slice(1)));
  return !lists && args.some((arg) => !arg.startsWith('-'));
};

const checkGit = (args) => {
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) {
    i += GIT_VALUE_OPTIONS.has(args[i]) ? 2 : 1;
  }
  const [command, ...rest] = args.slice(i);
  if (command === 'push') {
    return PUSH;
  }
  if (command === 'tag' && writesTag(rest)) {
    return TAG;
  }
  if (
    command === 'update-ref' &&
    rest.some((arg) => arg.startsWith('refs/tags/'))
  ) {
    return TAG;
  }
  return null;
};

const API_VALUE_OPTIONS = new Set([
  '--cache',
  '--header',
  '--hostname',
  '--jq',
  '--preview',
  '--template',
  '-H',
  '-p',
  '-q',
  '-t',
]);

const checkApi = (args) => {
  let method;
  let endpoint;
  let input = false;
  const fields = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const equals = arg.startsWith('--') ? arg.indexOf('=') : -1;
    const name = equals === -1 ? arg : arg.slice(0, equals);
    const value = () => (equals === -1 ? args[++i] : arg.slice(equals + 1));
    if (name === '-X' || name === '--method') {
      method = value();
    } else if (/^-X./.test(arg)) {
      method = arg.slice(2);
    } else if (['-f', '-F', '--field', '--raw-field'].includes(name)) {
      fields.push(value() ?? '');
    } else if (/^-[fF]./.test(arg)) {
      fields.push(arg.slice(2));
    } else if (name === '--input') {
      input = true;
      value();
    } else if (API_VALUE_OPTIONS.has(name)) {
      value();
    } else if (!arg.startsWith('-') && endpoint === undefined) {
      endpoint = arg;
    }
  }
  const verb = (
    method ?? (fields.length > 0 || input ? 'POST' : 'GET')
  ).toUpperCase();
  const path = (endpoint ?? '').replace(/^\/+/, '');
  if (verb === 'GET' || verb === 'HEAD') {
    return null;
  }
  if (fields.some((field) => /^draft=(0|f|false)$/i.test(field))) {
    return PUBLISH;
  }
  if (
    /(^|\/)releases\/?$/.test(path) &&
    (input || !fields.some((field) => /^draft=(1|t|true)$/i.test(field)))
  ) {
    return RELEASE;
  }
  if (/(^|\/)releases\/\d+\/?$/.test(path) && input) {
    return PUBLISH;
  }
  if (/(^|\/)git\/(refs|tags)(\/|$)/.test(path)) {
    return REFS;
  }
  if (
    path === 'graphql' &&
    fields.some((field) => /\b(createRef|deleteRef|updateRefs?)\b/.test(field))
  ) {
    return REFS;
  }
  return null;
};

const checkGh = (args) => {
  const [group, action, ...rest] = args;
  if (group === 'release' && action === 'create') {
    return flag(rest, 'draft', 'd', 'FnRt') === true ? null : RELEASE;
  }
  if (group === 'release' && action === 'edit') {
    return flag(rest, 'draft') === false ? PUBLISH : null;
  }
  if (group === 'release' && action === 'delete') {
    return flag(rest, 'cleanup-tag') === true ? TAG : null;
  }
  if (group === 'pr' && action === 'create') {
    const head = rest.some(
      (arg) => arg === '--head' || arg.startsWith('--head=') || /^-H/.test(arg)
    );
    return head ? null : PR_PUSH;
  }
  if (group === 'api') {
    return checkApi(args.slice(1));
  }
  return null;
};

const PACKAGE_VALUE_OPTIONS = new Set([
  '--dir',
  '--filter',
  '--prefix',
  '--registry',
  '-C',
  '-F',
]);

const checkPackageManager = (args) => {
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) {
    i += PACKAGE_VALUE_OPTIONS.has(args[i]) ? 2 : 1;
  }
  return ['publish', 'unpublish'].includes(args[i]) ? NPM : null;
};

/** The reason to block one simple command, or null to let it run. */
const checkCommand = (words) => {
  const [program, ...args] = unwrap(words);
  if (program === undefined) {
    return null;
  }
  const name = basename(program).replace(/@[^@/]*$/, '');
  if (SHELLS.has(name)) {
    const option = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/.test(arg));
    return option === -1 ? null : check(args[option + 1] ?? '');
  }
  if (name === 'eval') {
    return check(args.join(' '));
  }
  if (
    name === 'npx' ||
    (name === 'pnpm' && ['dlx', 'exec'].includes(args[0]))
  ) {
    const rest = name === 'npx' ? args : args.slice(1);
    const start = rest.findIndex((arg) => !arg.startsWith('-'));
    return start === -1 ? null : checkCommand(rest.slice(start));
  }
  if (name === 'git') {
    return checkGit(args);
  }
  if (name === 'gh') {
    return checkGh(args);
  }
  if (['npm', 'pnpm', 'yarn'].includes(name)) {
    return checkPackageManager(args);
  }
  return null;
};

/** The reason to block a whole command line, or null to let it run. */
const check = (text) => {
  for (const words of parse(text)) {
    const reason = checkCommand(words);
    if (reason) {
      return reason;
    }
  }
  return null;
};

const main = () => {
  let call;
  try {
    call = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return 0;
  }
  const command = call?.tool_input?.command;
  if (call?.tool_name !== 'Bash' || typeof command !== 'string') {
    return 0;
  }
  const reason = check(command);
  if (reason === null) {
    return 0;
  }
  process.stderr.write(
    `Blocked by .claude/hooks/release-guard.js: ${reason} (ADR 0078)\n`
  );
  return 2;
};

process.exitCode = main();
