---
name: create-pr
description: Commit changes, publish/push the branch, and create a pull request using repository conventions.
---

Create a pull request using the supplied PR name.

---

# Request

$ARGUMENTS

<!--
Example:

/create-pr
PR name: Add order manager smoke tests

-->

---

# Responsibilities

This workflow must:

1. Inspect the current git status and diff
2. Review all changed files
3. Ensure branch naming follows repository conventions
4. Publish the branch if it has not been published yet
5. Commit all staged/unstaged relevant changes
6. Push the branch to remote
7. Create a pull request targeting `main` with the supplied PR name
8. Generate a clean PR description from the changes

---

# Git Workflow Rules

## Before Committing

1. Run `git status`
2. Run `git diff` to review changes
3. Exclude these files from commits unless explicitly tracked:
   - `node_modules/`
   - `test-results/`
   - `playwright-report/`
   - `allure-results/`
   - `allure-report/`
   - `downloads/`
   - `screenshots/`
   - `.env`, `.env.*`
   - `playwright/.auth/*.json`
   - Any temp/debug files

4. Stage only relevant files by name — never use `git add -A` or `git add .`

---

## Commit Rules

- Create a meaningful commit message that describes the change
- Commit message types for this repo: feature, fix, test automation, refactor, report update
- End the commit message with:

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Commit Message Format

```bash
git commit -m "$(cat <<'EOF'
<Short descriptive message matching repo style>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Examples matching this repo's style:
- `Add order manager smoke tests`
- `Refactor TempProfile page to use API seeding`
- `Fix login page locator after UI update`
- `Update Allure report configuration`

---

## Branch Rules

Before pushing:

1. Check current branch with `git branch --show-current`
2. Refuse to push directly to: `main`, `master`, `develop`, `gh-pages`
3. If branch is unpublished, publish it:

```bash
git push --set-upstream origin <branch-name>
```

4. Branch naming convention (kebab-case observed in this repo):
   - `add-<feature>`
   - `fix-<issue>`
   - `refactor-<area>`

---

# Pull Request Rules

## PR Title

Use the exact provided PR name as the title.

## PR Base Branch

Always target `main`.

## PR Description

Generate a concise body using `gh pr create`:

```bash
gh pr create --title "<PR name>" --base main --body "$(cat <<'EOF'
## Summary
- <bullet: what was added or changed>

## Files Updated
- <key spec, page object, API, or config files changed>

## Test Coverage
- Tests added / modified
- Tags affected (@smoke / @regression / @api)

## Notes
- <assumptions, limitations, or follow-up items if applicable>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

# Safety Rules

- Never force push unless explicitly requested
- Never commit `.env` files or auth JSON files (`playwright/.auth/`)
- Never include test-result artifacts (screenshots, videos, reports) unless intentionally tracked
- Never modify files unrelated to the task
- Confirm `git status` is clean after push

---

# Output Requirements

Provide:

1. Current branch name
2. Files committed
3. Commit message used
4. Push result
5. Pull request URL
6. Any warnings or skipped files

---

# Validation Checklist

Before creating PR:

- [ ] Branch is not `main` / `master` / `develop` / `gh-pages`
- [ ] Only relevant files staged
- [ ] No `.env`, auth JSON, or artifact files included
- [ ] Co-authored-by line present in commit
- [ ] Branch published successfully
- [ ] Push completed successfully
- [ ] PR created targeting `main` with correct title
- [ ] PR description generated
- [ ] Working tree clean after push
