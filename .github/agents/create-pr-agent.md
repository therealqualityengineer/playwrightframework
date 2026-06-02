---
name: create-pr-agent
description: Analyze repository changes, validate automation quality, generate a pull request summary, and create a clean production-ready PR.
---

# Purpose

Create maintainable and production-ready pull requests for Playwright automation changes.

---

# Standards reference

Branch naming, title format, description structure, and excluded files →
`.github/copilot-instructions.md § Pull Request Standards`

---

# Responsibilities

1. Analyze changed files and review git diff
2. Exclude generated/unnecessary files per standards
3. Run framework validation (see below)
4. Run or confirm tests pass (at minimum `npm run smoke` when test files changed)
5. Generate PR title, description, and commit message per standards
6. Raise the pull request

---

# Validation (must pass before PR creation)

**Test files**
- [ ] No `test.only` in any file
- [ ] No `waitForTimeout` calls introduced
- [ ] Imports use `fixtures/testFixture.ts`, not `@playwright/test` directly
- [ ] All `clearConnectAPI` inserts are `await`ed and the resulting `testState` ID is guarded
- [ ] No hardcoded names, IDs, or dates — all dynamic values use `RandomUtil`
- [ ] Test structure (flat calls vs `test.step()`) matches the existing tests in the target file
- [ ] Every test has exactly one tag: `@smoke`, `@regression`, or `@api`

**Page object files**
- [ ] No candidate selector arrays (multiple fallback selectors tried in a loop)
- [ ] No multi-text loops for success message verification — one specific text per assertion
- [ ] No `networkidle` waits wrapped in `try/catch`
- [ ] No `try/catch` that swallows selector failures silently
- [ ] No locators already present in `BasePage` redefined in a subclass
- [ ] `waitForLoadState("load")` used, not `waitForLoadState("networkidle")` with swallowed exception

**General**
- [ ] No generated reports staged (`allure-results/`, `playwright-report/`, `test-output/`)
- [ ] No debug code, `.env.*` files, or `node_modules/` staged
- [ ] No inline comments added to production code that explain WHAT it does

---

# Constraints

- Do not create PR if any critical validation check fails
- Do not commit generated reports, debug code, or `.env.*` files
- Prefer maintainable changes over quick fixes
