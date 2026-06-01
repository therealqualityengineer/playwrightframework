```md id="5m0k1d"
---
name: create-pr-agent
description: Analyze repository changes, validate automation updates, generate a pull request summary, and create a clean production-ready PR.
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

- No `test.only` in any file
- No `waitForTimeout` calls introduced
- No generated reports staged (`allure-results/`, `playwright-report/`, `test-output/`)
- Imports use `fixtures/testFixture.ts`, not `@playwright/test` directly
- No duplicate locators or methods already present in `BasePage`
- No debug code or hardcoded values

---

# Constraints

- Do not create PR if any validation check above fails critically
- Do not commit generated reports, debug code, or `.env.*` files
- Prefer maintainable changes over quick fixes
```
