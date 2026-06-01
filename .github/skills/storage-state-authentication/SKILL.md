# Skill: Storage State Authentication

## Purpose

Set up Playwright's `storageState` pattern for suites that require a specific user role. Establishes a session once in `beforeAll`, saves it to disk, and reuses it across all tests — avoiding repeated UI login.

**Use when:** All tests in the file share the same non-default user, the suite has 3+ tests, and `defaultUser` lacks the required permissions.

**Do not use when:** Tests need different users (use `loginPage.login()` per test), there are only 1–2 tests (`defaultLogin()` is simpler), or the test is validating the login flow itself.

---

## User → auth file mapping

| Key | Username | Auth file | Typical suite |
|-----|----------|-----------|--------------|
| `defaultUser` | qaengineer | — | `defaultLogin()` only — never use with storageState |
| `validUser1` | testuser_01 | — | Login feature tests |
| `validUser2` | testuser_02 | — | Client Manager tests |
| `validUser3` | testuser_03 | `playwright/.auth/orderUser.json` | Order Manager |
| `validUser4` | testuser_04 | — | Available |
| `validUser5` | testuser_05 | `playwright/.auth/TimecardUser.json` | Timecard |
| `validUser6` | testuser_06 | — | Available |

**Naming:** `playwright/.auth/<FeatureUser>.json`. If two spec files share the same role, reuse the same auth file — do not create duplicates.

---

## Implementation

### 1 — Imports

```ts
import { test, expect } from "../../../fixtures/testFixture";
import { LoginPage } from "../../../pages/LoginPage";   // manually instantiated in beforeAll
import { RandomUtil } from "../../../utils/RandomUtil";
const users = require("../../../test-data/users.json");
```

`LoginPage` must be imported from `pages/LoginPage.ts` and instantiated manually — Playwright fixtures are not available inside `beforeAll`.

### 2 — `beforeAll`

```ts
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.login(users.validUser3.username, users.validUser3.password);
  await loginPage.verifySuccessfulLogin();   // always include — catches broken credentials before saving state
  await page.context().storageState({ path: "playwright/.auth/orderUser.json" });
  await page.close();
});
```

### 3 — Apply to all tests (file top level)

```ts
test.use({ storageState: "playwright/.auth/orderUser.json" });
```

Place immediately after `beforeAll`, at the **file's top level** — never inside `test.describe()`. The path must exactly match `beforeAll`.

### 4 — Tests — no login call needed

```ts
test("@regression Create a new order", async ({ loginPage, orderPage }) => {
  // No defaultLogin() — session is already active
  await loginPage.navigateToPage("ordermanager-legacy.cfm");
  // ...
});
```

`loginPage.navigateToPage()` is still used for navigation — only the login call is removed.

---

## Using `test.describe` with storageState

`beforeAll` and `test.use()` stay at the file level — they apply inside all `describe` blocks automatically:

```ts
test.beforeAll(async ({ browser }) => { /* auth */ });
test.use({ storageState: "playwright/.auth/TimecardUser.json" });

test.describe("Timecard Reconciliation", () => {
  test.beforeEach(async ({ clearConnectAPI }) => {
    await clearConnectAPI.insertTempRecords({ ... });
    await clearConnectAPI.insertClients({ ... });
  });

  test.afterEach(async ({ cleanupDownloads }) => {
    void cleanupDownloads;
  });

  test("@regression Reconcile filled order", async ({ ... }) => { ... });
});
```

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Calling `loginPage.defaultLogin()` inside a test | Remove it — the session is already active |
| `test.use()` placed inside `test.describe()` | Move to file's top level |
| Path mismatch between `beforeAll` and `test.use()` | Make both strings identical, including case |
| `verifySuccessfulLogin()` omitted from `beforeAll` | Always include — a broken credential silently stores a logged-out state otherwise |
| `LoginPage` imported via fixture instead of `pages/LoginPage.ts` | Import directly from `pages/LoginPage.ts` |
| New auth file created when one exists for that role | Check `playwright/.auth/` first and reuse |
| `page.close()` missing at end of `beforeAll` | Always close to release the browser context |
