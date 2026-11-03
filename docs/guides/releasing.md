# Releasing

How a version of react-rewards gets from `master` to npm: choose the version from what changed, bump it on a release branch, merge that, then publish a GitHub release, which runs the publish workflow ([ADR 0054](../decisions/0054-publish-from-github-release.md)).

The examples use `X.Y.Z` for the new version, and `$LAST` for the last release's tag, such as `v3.1.0`.

Pre-releases aren't supported. The workflow skips a release marked as one, and every release goes on npm's `latest`. Supporting them needs a new ADR (ADR 0054).

## The policy, in brief
[ADR 0075](../decisions/0075-versioning-policy.md) has the rules, specific enough to classify each change. In short:

- **Major:** a change that can break code or a setup that worked: an export, option, setting or member removed or renamed; a type that accepts less, or hands back more; a documented behaviour changed; the stepping or a math helper changed, which custom effects rely on; a higher lowest React; or an environment dropped.
- **Minor:** an addition, such as an export, an optional option, a setting or an optional contract method; a deliberate change to a built-in effect's look or defaults; or a deprecation.
- **Patch:** a fix that makes something look or behave as intended, or a change users can't see.
- **No release:** the site, docs, tests, CI, the agents, and dev dependencies that leave `dist/` unchanged.

The release takes the highest level among its changes. A change the rules don't cover is the maintainer's to classify.

## 1. Collect the changes since the last tag
```sh
git fetch --tags origin
LAST=$(git describe --tags --abbrev=0 origin/master)
git show origin/master:package.json | grep '"version"'   # the same version as $LAST
```

- **The commits:** `git log --oneline --no-merges "$LAST"..origin/master`. Their conventional-commit types are a first sort: `feat` usually adds something, `fix` usually fixes something, and `docs`, `test`, `refactor`, `chore`, `ci` and `build` usually change nothing users get. A `!` before the colon, such as `feat!:`, or a `BREAKING CHANGE:` footer marks a breaking change:
  ```sh
  git log --format='%h %s' "$LAST"..origin/master | grep -E '^[0-9a-f]+ [a-z]+(\([^)]*\))?!:'
  git log --format='%h %s' --grep='BREAKING CHANGE' "$LAST"..origin/master
  ```
  The types are hints, and the policy decides. A `chore` can raise a peer dependency, and a `fix` can change documented behaviour.
- **The merged PRs:** `git log --first-parent --merges --oneline "$LAST"..origin/master`, and each one's description with `gh pr view <number>`.
- **What changed in the package:** `git diff --stat "$LAST"..origin/master -- src package.json rslib.config.ts`, and `git diff "$LAST"..origin/master -- package.json` for the peer dependencies, `exports` and `files`.
- **The decisions:** `git diff --name-status "$LAST"..origin/master -- docs/decisions`. A new ADR usually states what a change is and why.

## 2. Read the API report's diff
`etc/react-rewards.api.md` is the public API as the built declarations state it, and CI keeps `master`'s copy current ([ADR 0074](../decisions/0074-api-report-with-api-extractor.md)). If the last tag has the report too:

```sh
git diff "$LAST"..origin/master -- etc/react-rewards.api.md
```

The report is newer than `v3.0.0` and `v3.1.0`. For a tag without it, build the tag in a temporary worktree and generate its report there, with this checkout's API Extractor and config, then compare it with `master`'s:

```sh
REPO=$PWD
WT=$(mktemp -d)
git worktree add --detach "$WT" "$LAST"
(cd "$WT" && pnpm install --frozen-lockfile && pnpm build \
  && cp "$REPO/api-extractor.json" . && mkdir -p etc \
  && "$REPO/node_modules/.bin/api-extractor" run --local)
git show origin/master:etc/react-rewards.api.md > "$WT/master.api.md"
git diff --no-index "$WT/etc/react-rewards.api.md" "$WT/master.api.md"
git worktree remove --force "$WT"
```

The tag's own `pnpm install` is needed, so its declarations find the React types they import.

Reading the diff:
- Only added lines, for a new `export` or an optional member (`?`): an addition, so a minor.
- A removed or changed line: check it against the major rules. A member or parameter that gained `?` accepts more, and one that lost it accepts less. A union the library hands back, such as `BurstEnd`, that gained a member hands back more.
- Blocks without `export`, such as `interface Point`, are types that public signatures use without exporting. A change to one counts as a change to the signatures that use it.
- `// (undocumented)` marks, and comments inside a type, are documentation, not API.
- The report doesn't show defaults, looks, behaviour, the stepping, peer dependencies or environments. Those come from step 1.

## 3. Choose the version
List each change that ships, with its level and the rule of ADR 0075 that sets it, and take the highest. A major resets the minor and the patch (3.1.0 to 4.0.0), and a minor resets the patch (3.1.0 to 3.2.0). If a change isn't covered by the rules, the maintainer classifies it before anything else happens.

A major needs its upgrade article on the site, merged before the release, as 3.0.0 has "Upgrading from v2" (ADR 0075).

## 4. Make the release branch
```sh
git fetch
git switch --no-track -c chore/release-X.Y.Z origin/master
```

`--no-track` keeps a plain push from landing on `master` (`AGENTS.md`, "Starting a branch"). If the docs need catching up with what merged, such as ADRs still "Proposed", that is the branch's first commit, as on any branch.

## 5. Bump the version and write the CHANGELOG entry
One commit, `chore: bump the version to X.Y.Z`, whose body says what the entry covers:
- `version` in `package.json` becomes `X.Y.Z`. Nothing else in `package.json` changes, and the lockfile doesn't record it.
- `CHANGELOG.md` gets a `## X.Y.Z` section above the last release's. Its sections are "Breaking changes", "Added", "Changed" and "Fixed", in that order, without empty ones (ADR 0075). A major's entry opens with a line linking its upgrade article, as 3.0.0's does.

Write each entry for someone upgrading, not as a list of commits: what they get or must change, the export or setting in code, and a link to its page on the site. Leave out what users can't see. For two made-up effects, a new `sparkle` and a changed `glitter`:

```md
## X.Y.Z

### Added
- `sparkle`: sparks that burst out in every direction and fade. Its settings, typed as `SparkleConfig`, are on [its page of the docs](https://thedevelobear.github.io/react-rewards/#sparkle).

### Changed
- `glitter` twinkles as it fades. Set `twinkle` to `0` for the steady fade.
```

## 6. Check the branch
Run every check, as the qa agent does: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm api:check`, `pnpm lint:package`, `pnpm --filter demo typecheck`, `pnpm size` and `pnpm e2e`. `npm pack --dry-run` lists what will be published. The publish workflow runs `prepublishOnly` (`pnpm typecheck && pnpm test && pnpm build`) again before it publishes.

## 7. Merge
The maintainer pushes the branch with `git push -u origin chore/release-X.Y.Z`, opens its PR into `master`, and merges it without squashing once CI passes ([ADR 0009](../decisions/0009-no-squash-merges.md)).

## 8. Draft the GitHub release
After the merge, draft the release on the merge commit, with the CHANGELOG entry as its notes:

```sh
git fetch
SHA=$(git log --first-parent -1 --format=%H -F --grep='/chore/release-X.Y.Z' origin/master)
git log -1 --format='%h %s' "$SHA"                       # Merge pull request #N from …/chore/release-X.Y.Z
git show "$SHA":package.json | grep '"version"'          # "X.Y.Z"
NOTES=$(mktemp)
git show "$SHA":CHANGELOG.md \
  | awk -v h='## X.Y.Z' '$0 == h {on=1; next} /^## / {on=0} on' > "$NOTES"
gh release create vX.Y.Z --draft --target "$SHA" --title vX.Y.Z --notes-file "$NOTES"
gh release view vX.Y.Z
```

A PR merged by rebase has no merge commit, so `SHA` is then the bump commit, found with `-F --grep='chore: bump the version to X.Y.Z'`.

A draft runs nothing, since the workflow runs on `release: published`, and has no tag yet: `git ls-remote --tags origin vX.Y.Z` prints nothing. Publishing creates the tag on `--target`. A full SHA tags the release PR's merge, where `--target master` would tag whatever `master` holds when the release is published.

## 9. Publish
The maintainer opens the draft (`gh release view vX.Y.Z --web`), reads the notes, leaves "Set as a pre-release" unticked, and publishes it. That creates the tag `vX.Y.Z` and runs `.github/workflows/publish.yml`, which fails unless the tag is `v` and the `package.json` version, then publishes with npm 11 and provenance ([ADR 0065](../decisions/0065-publish-with-pinned-npm.md)). Agents never publish a release.

## 10. Check the publish
```sh
gh run list --workflow publish.yml --limit 3
gh run watch <run-id> --exit-status                       # or: gh run view <run-id> --log-failed
npm view react-rewards@X.Y.Z version dist.attestations.provenance.predicateType
npm view react-rewards dist-tags                          # latest: X.Y.Z
git fetch --tags origin && git rev-parse 'vX.Y.Z^{commit}'   # the merge commit
```

The provenance line is `https://slsa.dev/provenance/v1`. If the workflow failed, nothing reached npm. A release runs the workflow from its tagged commit, so a fix to the workflow needs the tag made again (ADR 0065), and how to redo the release is the maintainer's call. A version that reached npm can't be published again, so a broken one is fixed by the next patch.
