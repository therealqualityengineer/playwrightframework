# Copilot Instructions — Playwright CTMS Framework

Global guidance for this Playwright E2E framework. Feature-specific rules live in the instruction files listed below — those take precedence when their `applyTo` glob matches the file being edited.

## Instruction files

| File | Applies to |
|------|-----------|
| `.github/instructions/ui-testing.instructions.md` | `tests/UI/**/*.spec.ts` |
| `.github/instructions/api-testing.instructions.md` | `tests/API/**/*.spec.ts` |
| `.github/instructions/test-generation.instructions.md` | `tests/**/*.spec.ts` |
| `.github/instructions/flaky-tests.instructions.md` | `tests/**/*.spec.ts`, `pages/**/*.ts` |

---

## Commands

```bash
npm run test          # Run all tests (4 workers, chromium)
npm run test:qa       # QA environment (default)
npm run test:uat      # UAT environment
npm run test:stage    # Stage environment
npm run smoke         # @smoke tagged tests only
npm run regression    # @regression tagged tests only
npm run api           # @api tagged tests only
npm run debug         # Playwright interactive debugger
npm run allure        # Serve Allure report
npm run allure:clear  # Clear allure-results and allure-report
npm run html          # Open Playwright HTML report
npm run agent         # AI test generator (interactive or with args)
```

```bash
npx playwright test tests/UI/TempManager/TempProfile.spec.ts  # single file
npx playwright test --grep "test title here"                   # single test
```

---

## Directory structure

```
PlaywrightFramework/
├── fixtures/testFixture.ts          # Custom typed fixtures (page objects + testState)
├── pages/
│   ├── BasePage.ts                  # Base class — common wrappers & shared locators
│   ├── ClearConnectAPI.ts           # REST API layer
│   ├── SessionManager.ts            # Bearer token management
│   └── [FeaturePage].ts            # Feature page objects
├── interfaces/                      # TypeScript interfaces (e.g. ClientData.ts)
├── utils/RandomUtil.ts              # Dynamic test data helpers
├── test-data/
│   ├── AllverificationData.ts       # Static assertion strings & paySchedule enum
│   ├── Types.ts                     # Ambient global type declarations (no import needed)
│   ├── MultipleClientData.ts        # Data-driven arrays
│   └── users.json                   # Named test user credentials
├── tests/
│   ├── UI/Login|TempManager|ClientManager|OrderManager|Timecard/
│   ├── API/ClearConnect.spec.ts
│   └── seed.spec.ts
├── playwright.config.ts             # Config: headless=false, retries=0, 4 workers
├── .env.qa / .env.uat / .env.stage  # Environment variables
└── .github/
    ├── copilot-instructions.md      # This file
    └── instructions/                # Feature-specific instruction files
```

---

## Core rules (apply everywhere)

- **Always import `test` and `expect` from `fixtures/testFixture.ts`**, never from `@playwright/test` directly.
- **Never add `waitForTimeout`** — use Playwright's built-in auto-waiting and explicit assertions.
- **Never commit `test.only`** — it silently skips all other tests in the file.
- **Never hardcode names, IDs, or dates** — use `RandomUtil` for all dynamic values.
- **Check `BasePage` before defining locators** in a subclass: `saveButton`, `addressTextbox`, `cityTextbox`, `stateTextbox`, `zipTextbox`, `statusDropdown` are already provided.
- **`testState`** is per-test only — never use it to share state between tests.
- Global payload types (`insertOrderPayload`, `TempData`, `TempRecord`, etc.) are ambient globals from `test-data/Types.ts` — no import needed.

---

## Environment

- Config loads `.env.{NODE_ENV}` via dotenv; defaults to `.env.qa`.
- Switch with `NODE_ENV=uat npm run test` or use the `npm run test:uat` alias.
- Required env vars: `BASE_URL`, `API_USERNAME`, `API_PASSWORD`, plus UI credentials used by `LoginPage`.
- Tests run headed (`headless: false`), no retries (`retries: 0`), screenshots/video captured on failure only.

---

## Pull Request Standards

### Branch naming
`feature/<desc>` · `fix/<desc>` · `refactor/<desc>` · `test/<desc>` · `chore/<desc>`

### PR title
Concise imperative phrase, ≤ 72 characters. Examples:
- `Add TempManager regression tests`
- `Fix flaky order creation tests`
- `Refactor API seeding utilities`

### PR description
| Section | Content |
|---------|---------|
| **Summary** | One sentence — what changed and why |
| **Changes** | Files/modules affected (tests, page objects, API helpers) |
| **Validation** | Test command run, environment, pass/fail status |

### Pre-create checklist
- [ ] No `test.only` in any file
- [ ] No `waitForTimeout` introduced
- [ ] Imports use `fixtures/testFixture.ts`, not `@playwright/test` directly
- [ ] No duplicate locators or methods already present in `BasePage`
- [ ] No debug code, hardcoded values, or generated reports staged

### Files to exclude from commits
`allure-results/` · `playwright-report/` · `test-output/` · `node_modules/` · `.env.*`

---

## CI/CD

- Workflow: `.github/workflows/PlaywrightPipeline.yml` — manual trigger (`workflow_dispatch`)
- Runs `npm run test`, generates Allure report with history, deploys to GitHub Pages, sends Slack notification via `SLACK_WEBHOOK` secret.
