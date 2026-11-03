# 0078. Claude Code's settings block pushes, tags and publishing

- **Status:** Proposed
- **Date:** 2026-11-03

- `.claude/settings.json` denies the plain forms: `Bash(git push *)`, `Bash(git tag -d *)`, `Bash(git tag --delete *)`, `Bash(npm publish *)` and `Bash(pnpm publish *)`. A deny rule matches each command of a compound command, but not the same program written another way, such as `git -C . push`.
- A `PreToolUse` hook on Bash, `.claude/hooks/release-guard.js`, run with Node, reads each command and blocks, with exit code 2 and the reason, what the rules can't express:
  - a push in any form: with options before `push`, after `&&` or `;`, in a subshell, a command substitution, `bash -c`, `eval` or a here-document fed to a shell, and `gh pr create` without `--head`, which can push the branch;
  - creating or deleting a tag: `git tag` with a name or a write option, `git update-ref refs/tags/…`, `gh release delete --cleanup-tag`, and writes to `git/refs` or `git/tags` through `gh api`;
  - a GitHub release created without `--draft`, by `gh release create` or `gh api`;
  - publishing a draft: `gh release edit --draft=false`, or `draft=false` through `gh api`;
  - `publish` or `unpublish` by `npm`, `pnpm` or `yarn`, through `npx` too.
- Listing tags (`git tag --list`, `git describe --tags`, `git for-each-ref refs/tags`), drafting a release (`gh release create --draft`) and reading GitHub with `gh api` still work.
- Hooks run in subagents too, so the orchestrator and every agent are blocked alike. The maintainer pushes, and publishes releases, outside Claude Code.

**Why:** A push to a shared branch, a tag and a version on npm can't be taken back, and an instruction in an agent's file can be missed. Claude Code enforces the settings whatever the agent intends. Deny rules alone miss a push written another way, so the hook reads the whole command.

**Consequences:** The hook reads commands as text, so it stops mistakes, not an agent set on getting around it: a git alias, or a script that pushes, still runs. No one can push from Claude Code in the repo, since a local setting can't lift a project's deny rule. A new command in the release flow is checked against the hook.
