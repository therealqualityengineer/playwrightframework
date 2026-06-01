```md
---
name: new-test
description: Add a new UI/API automation test to an existing spec file using current framework conventions, reusable helpers, page objects, fixtures, and utilities.
---

Add a new automated test to the target spec file using the manually supplied steps.

---

# Before Writing Code

1. Read and study the **target spec file**:
   - Test structure (flat or describe-block)
   - Hook pattern (`beforeAll`, `beforeEach`, `afterEach`)
   - Fixtures destructured in each test and hook
   - Naming conventions and tag style
   - Import paths
   - Assertion style

2. Read every **page object** referenced by the target spec (`pages/`) to find existing methods and locators before creating new ones.

3. Read `fixtures/testFixture.ts` to confirm available fixtures and `TestState` fields.

4. Grep the codebase before adding any new locator, method, or utility.

5. Reuse existing implementations whenever possible.

---

# Request

$ARGUMENTS

<!--
TEMPLATE — copy and fill in when invoking /new-test:

File: tests/UI/TempManager/TempProfile.spec.ts
Title: Update temp home region
Tag: @regression
Seed: Insert a temp via API before the test
Steps:
  1. Navigate to the temp profile using the seeded tempId
  2. Change the Home Region dropdown to "West"
  3. Click Save
  4. Verify a success message is visible
Assert: Success toast/message is visible after save
User: (optional) specific user from users.json — leave blank for default
-->

---

# Framework Reference

## Imports

All test files import from the custom fixture — **never** from `@playwright/test` directly:

```typescript
import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";
const users = require("../../../test-data/users.json");
```

Import depth (`../../../`) depends on the test file location under `tests/`.

---

## Available Fixtures

Destructure only what the test needs:

| Fixture | Type | Notes |
|---------|------|-------|
| `page` | Page | Playwright page object |
| `loginPage` | LoginPage | Auth and navigation |
| `tempPage` | TempPage | Temp (worker) UI operations |
| `clientPage` | ClientPage | Client UI operations |
| `orderPage` | OrderPage | Order UI operations |
| `timecardPage` | TimecardPage | Timecard UI — does NOT receive testState |
| `reportPage` | ReportPage | Report UI operations |
| `clearConnectAPI` | ClearConnectAPI | REST API wrapper |
| `testState` | TestState | Shared data object — flows through hooks and tests |
| `cleanupDownloads` | fixture | Teardown — clears `downloads/` after each test |

---

## TestState Fields

```typescript
testState.tempId          // populated by clearConnectAPI.insertTempRecords()
testState.temp_firstName  // populated by clearConnectAPI.insertTempRecords()
testState.temp_lastName   // populated by clearConnectAPI.insertTempRecords()
testState.clientId        // populated by clearConnectAPI.insertClients()
testState.clientName      // populated by clearConnectAPI.insertClients()
testState.orderId         // populated by clearConnectAPI.insertOrder()
testState.fileName        // set manually before download assertions
```

Always ensure `testState` fields are populated (in `beforeEach`/`beforeAll`) before reading them in a test.

---

## BasePage Methods

All page objects extend `BasePage`. Use these wrappers instead of raw Playwright calls:

```typescript
await this.TypeText(locator, value, locatorType);       // fill input
await this.Click(locator, locatorType);                 // click element
await this.ElementVisible(locator, locatorType);        // assert visible
await this.SelectOption(cssLocator, optionValue);       // select dropdown (CSS only)
await this.TypeTextEnter(locator, value, locatorType);  // fill then press Enter
await this.navigateToPage(relativeUrl);                 // navigate within baseURL
await this.verifyFileDownloaded(fileName);              // assert file in downloads/
```

**`locatorType` values:**

| Value | Maps to |
|-------|---------|
| `"locator"` | CSS selector or XPath |
| `"role"` | `getByRole(locator)` |
| `"text"` | `getByText(locator)` |
| `"testid"` | `getByTestId(locator)` |

**Locator priority:** `getByTestId` → `getByRole` → `getByLabel` → `getByText` → CSS → XPath (last resort)

---

## Test Organization Patterns

### Pattern A — Flat tests with shared `beforeAll` auth (storageState)

Used when all tests in a file share the same authenticated user.

```typescript
import { test, expect } from "../../../fixtures/testFixture";
import { LoginPage } from "../../../pages/LoginPage";
const users = require("../../../test-data/users.json");

test.setTimeout(60_000);

let loginPage: LoginPage;

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  loginPage = new LoginPage(page);
  await loginPage.defaultLogin();
  await page.context().storageState({ path: "playwright/.auth/user.json" });
  await page.close();
});

test.use({ storageState: "playwright/.auth/user.json" });

test.afterEach(async ({ cleanupDownloads }) => {
  void cleanupDownloads;
});

test("@regression Test name", async ({ orderPage, testState }) => {
  // test body
});
```

### Pattern B — Describe blocks with API seeding in `beforeEach`

Used when each test needs fresh seeded data.

```typescript
test.describe("Feature Name", () => {
  test.beforeEach(async ({ clearConnectAPI }) => {
    await clearConnectAPI.insertTempRecords({
      firstName: RandomUtil.generateRandomString(5),
      lastName: RandomUtil.generateRandomString(5),
      status: "1",
    });
  });

  test.afterEach(async ({ cleanupDownloads }) => {
    void cleanupDownloads;
  });

  test("@regression Test name", async ({ tempPage, testState }) => {
    await tempPage.someMethod(testState.tempId);
    expect(testState.tempId).toBeTruthy();
  });
});
```

---

## API Seeding

Use `clearConnectAPI` to seed data in `beforeEach`/`beforeAll`. These methods automatically populate the corresponding `testState` fields:

```typescript
// Seed a temp record → sets testState.tempId, temp_firstName, temp_lastName
await clearConnectAPI.insertTempRecords({
  firstName: RandomUtil.generateRandomString(5),
  lastName: RandomUtil.generateRandomString(5),
  status: "1",
});

// Seed a client → sets testState.clientId, clientName
await clearConnectAPI.insertClients({
  clientName: RandomUtil.generateRandomString(8),
  status: "1",
});

// Seed an order → sets testState.orderId (requires clientId first)
await clearConnectAPI.insertOrder({
  customerID: testState.clientId,
  status: "1",
});
```

---

## Test Data & Utilities

```typescript
// Random data generation
RandomUtil.generateRandomString(5)        // uppercase letters: "ABCDE"
RandomUtil.generateRandomNumber(4)        // numeric string: "1234"
RandomUtil.generateRandomAlphaNumeric(6)  // mixed: "A3B2C1"
RandomUtil.getDate(0)                     // today: "MM/DD/YYYY"
RandomUtil.getDate(7)                     // 7 days from today

// Verification constants
import { mainMenuQuickLinkText, adminUserLinkText } from "../../../test-data/AllverificationData";

// Pay schedule enum
import { paySchedule } from "../../../test-data/AllverificationData";
// paySchedule.Daily="0", Weekly="1", Biweekly="2", Monthly="3"
```

---

## Tags

Tags are embedded directly in the test title string:

```typescript
test("@smoke Create temp profile", ...)
test("@regression Update client address", ...)
test("@api Verify order via API", ...)
```

---

## Test Timeout

Add `test.setTimeout(120_000)` at the top of the file for tests with more than 2 steps. Use `60_000` for simpler files.

---

## Every UI Test Starts With

```typescript
await loginPage.defaultLogin();
```

Then navigate within the app using `navigateToPage(relativeUrl)`.

---

# Implementation Rules

## Core Rules

- The provided steps define WHAT to test.
- The existing framework defines HOW to implement it.
- Follow the supplied steps exactly in order.

## Reusability Rules

Before creating anything new:

1. Search for existing page object methods in `pages/`
2. Search for existing locators already defined in page objects
3. Search for existing utility functions in `RandomUtil`
4. Search for existing API methods in `ClearConnectAPI`
5. Reuse whenever available — only create new if genuinely missing

## If New Methods Are Needed

When adding a new method to a page object:

- Add it to the correct page object file (not inside the test)
- Follow existing `camelCase` verb-noun naming (`enterFirstName`, `clickSaveButton`)
- Use `BasePage` methods internally (`this.Click`, `this.TypeText`, etc.)
- Make it reusable and parameterized
- Avoid hardcoding test-specific values

---

# Constraints

- Import `{ test, expect }` from the fixture path, not `@playwright/test`
- Never use `waitForTimeout`
- Never add inline waits — rely on Playwright auto-waiting
- Do not duplicate setup/login logic already handled by `beforeEach`/`beforeAll`
- Do not rewrite existing helpers
- Match indentation and formatting exactly to the target spec file
- Keep imports minimal
- `fullyParallel` is disabled — tests within a file run serially

---

# Output Requirements

Provide:

1. Full updated spec (or only the new test block if adding to an existing file)
2. Any required page object additions or changes
3. Any utility/helper additions
4. Assumptions made (if any)
5. Why new methods were created (if applicable)

---

# Post-Creation

After writing the test:

1. Run the test using `npx playwright test` targeting the specific spec file.
2. If the test fails due to a code or locator error, use the Playwright MCP browser tools to inspect the live UI, identify the correct selectors or state, and fix the error.
3. Re-run until the test passes or the root cause is clearly identified and documented.

---

# Validation Checklist

Before finalizing:

- [ ] Imports use the fixture path, not `@playwright/test`
- [ ] All fixtures are declared in `fixtures/testFixture.ts`
- [ ] No `waitForTimeout` calls
- [ ] Locators follow priority order (`testid` → `role` → `text` → CSS)
- [ ] Tags are embedded in the test title string
- [ ] No duplicate logic vs existing hooks
- [ ] `BasePage` methods used instead of raw Playwright calls
- [ ] TypeScript types are valid (use ambient types from `Types.ts` where applicable)
- [ ] `testState` fields are populated before being read
- [ ] `cleanupDownloads` teardown is wired via `void cleanupDownloads` in `afterEach`
- [ ] Test follows the same organization pattern as the target spec file
- [ ] Test is maintainable and production-ready
```
