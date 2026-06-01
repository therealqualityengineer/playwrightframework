```md id="j4pd0d"
# PR Creation Skill

Standards (branch naming, title format, description structure, excluded files) are defined in
`.github/copilot-instructions.md → ## Pull Request Standards`. Follow those; do not duplicate them here.

## Execution steps

1. Run `git diff` — review all staged and unstaged changes
2. Identify and exclude generated/unnecessary files (see standards)
3. Validate: no `test.only`, no `waitForTimeout`, correct imports, no duplicate locators
4. If test files changed, run `npm run smoke` (at minimum) and confirm pass
5. Generate PR title and description per the standards
6. Create commit and raise the pull request
```
