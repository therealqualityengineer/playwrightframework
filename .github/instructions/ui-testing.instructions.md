---
applyTo: "tests/UI/**/*.spec.ts"
---

# UI Testing Instructions

These instructions apply to all Playwright UI test files under `tests/UI/`.

## Imports and fixture usage

Always import `test` and `expect` from the fixture, never from `@playwright/test` directly:

```ts
import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";
```

Destructure only the fixtures your test actually uses from the test function signature:

```ts
test("@smoke ...", async ({ page, loginPage, tempPage }) => { ... });
```

Available fixtures: `page`, `loginPage`, `tempPage`, `clientPage`, `orderPage`, `clearConnectAPI`, `timecardPage`, `reportPage`, `testState`, `cleanupDownloads`.

## Test tags

Every test must have exactly one tag:

- `@smoke` — critical happy path, runs in smoke suite
- `@regression` — full coverage, runs in regression suite

Place the tag at the start of the test title string: `"@smoke Create new temp"`.

## Test timeout

Add `test.setTimeout(120_000)` at the top of any file whose tests have more than two steps. For simple tests a timeout is not required.

## Login and navigation

Every UI test must start with `loginPage.defaultLogin()` unless the file uses `storageState` pre-authentication (see Auth state section).

Navigate within the app with `loginPage.navigateToPage(partialUrl)` — pass only the partial URL; it is resolved against `baseURL`:

```ts
await loginPage.navigateToPage("tempManagerClassicView.cfm");
```

## API seeding (preferred over UI setup)

Seed prerequisite records via API instead of UI to keep tests fast and focused. Use `clearConnectAPI` fixtures:

```ts
await clearConnectAPI.insertTempRecords({ firstName: "...", lastName: "..." });
// populates testState.tempId, testState.temp_firstName, testState.temp_lastName

await clearConnectAPI.insertClients({ clientName: "...", ... });
// populates testState.clientId, testState.clientName

await clearConnectAPI.insertOrder(...);
// populates testState.orderId
```

Navigate directly to the seeded record using `testState`:

```ts
await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
```

## Test data

Use `RandomUtil` for all dynamic values — never use hardcoded strings for names or IDs:

```ts
RandomUtil.generateRandomString(7)      // alpha string of given length
RandomUtil.generateRandomNumber(n)      // random number
RandomUtil.generateRandomAlphaNumeric(n)
RandomUtil.getDate(offsetDays)          // date offset from today
```

Static assertion strings live in `test-data/AllverificationData.ts`. Global payload types (`TempData`, `insertOrderPayload`, etc.) from `test-data/Types.ts` are ambient globals — no import needed.

## Auth state (storageState pattern)

For suites that require a specific user role (OrderManager, Timecard), authenticate once in `beforeAll` and reuse the saved state. See `.github/skills/storage-state-authentication/SKILL.md` for the full implementation, user → auth-file mapping, and common mistakes.

Key rules: import `LoginPage` directly from `pages/LoginPage.ts` (not from fixture), call `verifySuccessfulLogin()` before saving state, place `test.use({ storageState: "..." })` at the file's top level. With storageState active, omit `loginPage.defaultLogin()` from individual tests.

## Cleanup

When a test downloads files, add `afterEach` with the `cleanupDownloads` fixture:

```ts
test.afterEach(async ({ cleanupDownloads }) => {
  void cleanupDownloads;
});
```

## Assertions

Keep assertions inside test bodies. Only move them to page objects when the assertion is reused across multiple tests.

Use Playwright's built-in assertions — do not use raw `expect` from Jest or Node assert:

```ts
await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
await expect(page.locator("#someEl")).toBeVisible();
expect(testState.clientId).toMatch(/^\d+$/);
```

## What not to do

- **No `waitForTimeout`** — rely on Playwright's auto-waiting.
- **No `test.only`** — it silently skips all other tests during suite runs; remove before merging.
- **No hardcoded wait times or polling loops.**
- **No duplicate locators** — check `BasePage` for `saveButton`, `addressTextbox`, `cityTextbox`, `stateTextbox`, `zipTextbox`, `statusDropdown` before defining them in a subclass.
- **No direct Playwright imports** — always use the fixture re-export.

## Popup handling

Use the `waitForEvent` pattern:

```ts
const [popup] = await Promise.all([
  page.waitForEvent("popup"),
  page.click("selector"),
]);
await popup.waitForLoadState();
```

Reuse existing page objects with the popup's page instance rather than creating ad-hoc selectors.

## Parallelism

`fullyParallel` is disabled. Tests within a file run serially. Do not rely on shared mutable state between tests — use `testState` for intra-test state only.
