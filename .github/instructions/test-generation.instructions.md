---
applyTo: "tests/**/*.spec.ts"
---

# Test Generation Instructions

Follow these steps in order when creating a new test file or adding tests to an existing file.

---

## Step 1 — Choose the right location

| Test type | Directory |
|-----------|-----------|
| UI test for Temp Manager | `tests/UI/TempManager/` |
| UI test for Client Manager | `tests/UI/ClientManager/` |
| UI test for Order Manager | `tests/UI/OrderManager/` |
| UI test for Timecard | `tests/UI/Timecard/` |
| UI test for Login | `tests/UI/Login/` |
| API-only test | `tests/API/` |

Add tests to an existing spec file in the feature directory when they test the same feature area. Create a new file only when the feature has no existing spec file.

---

## Step 2 — Write the imports

```ts
import { test, expect } from "../../../fixtures/testFixture";   // adjust depth for your location
import { RandomUtil } from "../../../utils/RandomUtil";
```

Add optional imports only when actually used:

```ts
const users = require("../../../test-data/users.json");                        // named users
import { mainMenuQuickLinkText } from "../../../test-data/AllverificationData"; // static strings
import { multipleClientData } from "../../../test-data/MultipleClientData";     // data-driven arrays
import { LoginPage } from "../../../pages/LoginPage";                           // only in beforeAll for storageState
```

**Never** import `test` or `expect` from `@playwright/test` — always use the fixture re-export.

Global payload and record types (`insertOrderPayload`, `TempRecord`, `ClientRecord`, `OrderRecord`, `TempData`, etc.) are **ambient globals** from `test-data/Types.ts` — no import needed.

---

## Step 3 — Set the timeout

Add `test.setTimeout(120_000)` at the top of the file when any test in the file has more than two steps or calls the API. Omit it for simple login/navigation-only tests.

---

## Step 4 — Choose the authentication pattern

### Pattern A — `defaultLogin()` (most UI tests)

Use when tests run as the default user and no role-specific access is needed:

```ts
test("@smoke Create new temp", async ({ loginPage, tempPage }) => {
  await loginPage.defaultLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  // ...
});
```

### Pattern B — Named user login (Login feature tests, specific-role tests)

Use when the test itself is about login, or when a specific non-default user is required:

```ts
const users = require("../../../test-data/users.json");

test("@smoke Verify user can login", async ({ loginPage }) => {
  await loginPage.login(users.validUser1.username, users.validUser1.password);
  await loginPage.verifySuccessfulLogin();
});
```

Available user keys: `defaultUser`, `validUser1`, `validUser2`, `validUser3`, `validUser4`, `validUser5`, `validUser6`.

### Pattern C — `storageState` (Order Manager, Timecard — role-locked suites)

Use when all tests in the file require the same role-specific session. See `.github/skills/storage-state-authentication/SKILL.md` for the full implementation, user → auth-file mapping, and common mistakes.

Key points: authenticate once in `beforeAll` using `LoginPage` imported directly from `pages/LoginPage.ts`, call `verifySuccessfulLogin()` before saving state, place `test.use({ storageState: "..." })` at the file's top level. With `storageState` active, omit `loginPage.defaultLogin()` from individual tests — navigation still uses `loginPage.navigateToPage()`.

---

## Step 5 — Seed test data

Prefer API seeding over UI creation for prerequisite records. Only create records via UI when the test is specifically testing the create flow.

```ts
// Seed via API — fast, focused, reliable
await clearConnectAPI.insertTempRecords({
  firstName: RandomUtil.generateRandomString(7),
  lastName: RandomUtil.generateRandomString(7),
});
// testState.tempId, testState.temp_firstName, testState.temp_lastName are now set

await clearConnectAPI.insertClients({
  clientName: RandomUtil.generateRandomString(8),
});
// testState.clientId, testState.clientName are now set

await clearConnectAPI.insertOrder({
  customerID: testState.clientId,
  status: "Filled",
  filledBy: testState.tempId,
  jobDateStart: RandomUtil.getDate(0),
  jobDateEnd: RandomUtil.getDate(0),
});
// testState.orderId is now set
```

Guard IDs immediately after insert to surface failures early:

```ts
expect(testState.clientId).toMatch(/^\d+$/);
expect(testState.tempId).toBeTruthy();
```

Navigate directly to a seeded record by ID:

```ts
await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
```

For setup that applies to multiple tests in a file, put API seeding in `beforeEach`:

```ts
test.beforeEach(async ({ clearConnectAPI }) => {
  await clearConnectAPI.insertTempRecords({ ... });
  await clearConnectAPI.insertClients({ ... });
});
```

---

## Step 6 — Use existing page objects

Do not inline raw Playwright locator calls in test files. Use the page object methods. Available page objects and their key methods:

**`loginPage`** — `defaultLogin()`, `login(user, pass)`, `navigateToPage(partialUrl)`, `verifySuccessfulLogin()`, `verifyQuickLinkText(text)`

**`tempPage`** — `navigateToCreateTemp()`, `createNewTemp(TempData)`, `enableFlatPayBill(pay, bill)`, `verifyAutoPayDisplaysDisabled()`, `enableAutoPayAndVerifyFlatPayDisabled()`, `clickFacilitiesTab()`, `selectRegionInFacilities(region)`, `selectClientForFacilities(clientName)`, `clickFacilitiesFilterButton()`, `verifyClientFilteredInFacilities(clientName)`, `clickGetDrivingDistance()`, `verifyDrivingDistanceAndTime()`, `getDrivingDistanceMiles()`, `updateTemp(TempUpdateData)`

**`clientPage`** — `createNewClient(ClientData)`

**`orderPage`** — `createNewOrder(jobDate, shift, certs, speciality)`

**`timecardPage`** — `reconcileTimecard(orderId, imageOption)`, `postTimecard()`, `dailyPay()`, `closeTimecardPopup()`

**`reportPage`** — `navigateToReportPage()`, `downloadProfitabilityReport(tempName?, period?)`, `downloadTempProfilesReport(tempName?)`, `downloadTempProfilesByCertificationReport(tempName?, cert?)`, `downloadClientProfilesReport(clientName?)`, `verifyDataInExcel(fileName, expectedData)`

**`clearConnectAPI`** — `insertTempRecords(payload)`, `insertClients(payload)`, `insertOrder(payload)`, `getTemps(id)`, `getClients(id)`, `getOrders(id)`, `getCerts(payload)`

---

## Step 7 — Wrap actions in `test.step()`

Every test body must use `test.step()` to group actions into named phases. See `.github/skills/playwright-test-generation/SKILL.md` for the full naming convention and rules.

```ts
await test.step("Seed temp record via API", async () => {
  await clearConnectAPI.insertTempRecords({ ... });
  expect(testState.tempId).toBeTruthy();
});
await test.step("Navigate to temp profile", async () => {
  await loginPage.defaultLogin();
  await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
});
await test.step("Verify flat pay is enabled", async () => {
  await expect(page.locator("...")).toBeVisible();
});
```

Phases: seed → navigate → act → `'Verify …'` (always last, always has a specific assertion).

---

## Step 8 — Tag every test

- `@smoke` — happy path, critical flow; runs in smoke suite
- `@regression` — full coverage; runs in regression suite
- `@api` — API-only tests; runs in `npm run api`

Place the tag at the start of the test title string:

```ts
test("@smoke Create new temp", ...)
test("@regression Enable flat pay and bill", ...)
test("@api Verify API method getTemps", ...)
```

---

## Step 9 — Add file download cleanup when needed

When any test in the file downloads a file, add `afterEach` with `cleanupDownloads`:

```ts
test.afterEach(async ({ cleanupDownloads }) => {
  void cleanupDownloads;
});
```

---

## Step 10 — Write assertions

Keep assertions in the test body unless they are reused across multiple tests (in which case put them in the page object).

Use Playwright's built-in matchers:

```ts
await expect(page).toHaveURL("expected-partial-url.cfm");
await expect(page.locator("#element")).toBeVisible({ timeout: 15000 });
await expect(page.locator("#element")).toContainText("expected text");
expect(testState.orderId).toBeTruthy();
expect(someNumber).toBeGreaterThanOrEqual(1300);
```

---

## Templates

### UI test — API seeding + `test.step()`

```ts
import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";

test.setTimeout(120_000);

test("@regression <title>", async ({ loginPage, clearConnectAPI, testState, tempPage }) => {
  await test.step("Seed test data via API", async () => {
    await clearConnectAPI.insertTempRecords({
      firstName: RandomUtil.generateRandomString(7),
      lastName: RandomUtil.generateRandomString(7),
    });
    expect(testState.tempId).toBeTruthy();
  });

  await test.step("Navigate to feature", async () => {
    await loginPage.defaultLogin();
    await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
  });

  await test.step("Perform action", async () => {
    // page object methods only
  });

  await test.step("Verify outcome", async () => {
    // specific assertion
  });
});
```

### API test — seed + read + `test.step()`

```ts
import { test, expect } from "../../fixtures/testFixture";
import { RandomUtil } from "../../utils/RandomUtil";

test.setTimeout(120_000);

test("@api Verify API method <name>", async ({ clearConnectAPI, testState }) => {
  await test.step("Insert record via API", async () => {
    await clearConnectAPI.insertTempRecords({
      firstName: RandomUtil.generateRandomString(7),
      lastName: RandomUtil.generateRandomString(7),
    });
    expect(testState.tempId).toBeTruthy();
  });

  await test.step("Verify read method returns correct record", async () => {
    const response = await clearConnectAPI.getTemps(testState.tempId ?? "");
    expect(response[0]?.tempId).toBe(testState.tempId);
  });
});
```

For the storageState template and data-driven template, see `.github/skills/storage-state-authentication/SKILL.md` and `.github/skills/test-data-management/SKILL.md` respectively.

---

## Pre-merge checklist

The full checklist is in `.github/skills/playwright-test-generation/SKILL.md`. At minimum verify:

- [ ] No `test.only` anywhere in the file
- [ ] No `waitForTimeout` calls
- [ ] No hardcoded names, IDs, or dates — all dynamic values use `RandomUtil`
- [ ] No `import { test, expect } from '@playwright/test'` — must use the fixture re-export
- [ ] Every test body uses `test.step()` with a final `'Verify …'` step
- [ ] Every test has exactly one tag (`@smoke`, `@regression`, or `@api`)
- [ ] `test.setTimeout(120_000)` at file level when any test has more than two steps or API calls
- [ ] File download tests have `afterEach` with `void cleanupDownloads`
- [ ] API insert calls are `await`ed and IDs are guarded before use
