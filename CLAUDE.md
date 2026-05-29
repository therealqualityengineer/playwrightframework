# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run test                  # Run all tests (6 workers, chromium only)
npm run test:qa               # Run against QA environment (default)
npm run test:uat              # Run against UAT environment
npm run test:stage            # Run against Stage environment
npm run smoke                 # Run @smoke tagged tests only
npm run regression            # Run @regression tagged tests only
npm run api                   # Run @api tagged tests only
npm run debug                 # Run with Playwright debug UI
npm run allure                # Serve Allure report
npm run allure:clear          # Clear allure-results and allure-report
npm run html                  # Open Playwright HTML report
npm run agent                 # Run AI test generator (interactive or with args)
```

Run a single test file:
```bash
npx playwright test tests/UI/TempManager/TempProfile.spec.ts
```

Run a single test by title:
```bash
npx playwright test --grep "test title here"
```

## Architecture

**Environment config** — `playwright.config.ts` loads `.env.{NODE_ENV}` via dotenv (defaults to `.env.qa`). Set `NODE_ENV=uat|stage` to switch environments. Required env vars: `BASE_URL`, `API_USERNAME`, `API_PASSWORD`, plus UI credentials used by `LoginPage`.

**Fixture layer** (`fixtures/testFixture.ts`) — Extends Playwright's base `test` with typed fixtures that inject page objects and a per-test `TestState` object. All test files import `{ test, expect }` from this fixture, not directly from `@playwright/test`. The `TestState` object (`{ tempId, clientId, orderId, temp_firstName, temp_lastName, fileName }`) is passed into page objects so API calls can persist IDs for use within the same test. Notable exception: `TimecardPage` does **not** receive `testState`. The `cleanupDownloads` fixture deletes all files in the `downloads/` directory and is triggered via `void cleanupDownloads` in `afterEach`.

**Page Object Model** (`pages/`) — All page classes extend `BasePage`, which provides typed wrappers: `TypeText`, `Click`, `ElementVisible`, `SelectOption`, `TypeTextEnter`. These accept a `locatorType` string (`"locator" | "role" | "text" | "testid"`) to avoid scattering raw locator calls across page objects. `BasePage` also provides `verifyFileDownloaded(fileName, downloadPath?)` and `deleteFilesInDownloadFolder(downloadPath?)` for file download assertions.

**API layer** (`pages/ClearConnectAPI.ts`) — Wraps the ClearConnect REST API. Auth is managed by `SessionManager`, which lazily generates and validates a Bearer token using `API_USERNAME`/`API_PASSWORD`. The session key is cached as a static property and re-generated only when validation fails. API page objects receive the fixture's `APIRequestContext` (not a raw `fetch`).

**Test data** (`test-data/`) — `AllverificationData.ts` holds static assertion strings and the `paySchedule` enum. `Types.ts` declares global payload types (e.g. `insertOrderPayload`, `TempData`, `TempRecord`) as **ambient globals** — they are available in all TypeScript files without imports. `MultipleClientData.ts` and `users.json` provide data-driven test arrays. There is no `sharedData.ts` — inter-test state flows through the `TestState` fixture object instead.

**Test structure** (`tests/`) — Split into `UI/` (subdirs per feature: Login, TempManager, ClientManager, OrderManager, Timecard) and `API/` (ClearConnect.spec.ts). There is also a `seed.spec.ts` at the root of `tests/` for setup/seeding.

**Auth state** — Some test suites (e.g. OrderManager, Timecard) use Playwright's `storageState` pattern to pre-authenticate. A `beforeAll` block logs in a specific user from `users.json`, saves context state to `playwright/.auth/<name>.json`, and `test.use({ storageState: '...' })` reuses it for all tests in the file.

**AI test generator** (`agent/test-generator.ts`) — Uses `@anthropic-ai/sdk` with prompt caching to convert natural language descriptions into `.spec.ts` files. Run interactively with `npm run agent` or pass a description as CLI args. Reads framework context files at runtime to build the system prompt. Requires `ANTHROPIC_API_KEY` in the environment.

## Conventions

- **Locator priority**: `getByTestId` → `getByRole` → `getByLabel` → `getByText` → CSS → XPath (last resort only)
- **Tags**: `@smoke` for critical paths, `@regression` for full coverage, `@api` for API-only tests
- **Test timeout**: Add `test.setTimeout(120_000)` for tests with more than 2 steps
- Every UI test starts with `loginPage.defaultLogin()`; navigate within the app via `navigateToPage(url)`
- Use `RandomUtil` for dynamic data: `generateRandomString`, `generateRandomNumber`, `getDate(offsetDays)`
- Popup handling: `page.waitForEvent('popup')` pattern — reuse the popup's URL with an existing page object
- `fullyParallel` is disabled; tests within a file run serially. Cross-file parallelism uses 6 workers
- Keep assertions inside tests; only move them to page objects when the assertion is reusable across tests
- Do not add hardcoded `waitForTimeout` calls; rely on Playwright's built-in auto-waiting
- Do not duplicate locators or utility methods already present in `BasePage`

## CI/CD

GitHub Actions workflow (`PlaywrightPipeline.yml`) is manual-trigger only (`workflow_dispatch`). It runs `npm run test`, generates an Allure report with history, deploys to GitHub Pages, and sends a Slack notification via `SLACK_WEBHOOK` secret.
