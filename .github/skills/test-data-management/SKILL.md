# Skill: Test Data Management

## Purpose

Correctly source, generate, and pass test data. Covers `RandomUtil`, ambient global types, `TestState` lifecycle, user credentials, and data-driven patterns. This is the authoritative reference for data handling — instruction files contain brief mentions only.

---

## Rule 1 — Never hardcode dynamic values

| Need | Method |
|------|--------|
| Person name (first or last) | `RandomUtil.generateRandomString(7)` |
| Company / entity name | `RandomUtil.generateRandomString(8)` |
| ID or reference code | `RandomUtil.generateRandomAlphaNumeric(10)` |
| Numeric field | `RandomUtil.generateRandomNumber(n)` |
| Today's date | `RandomUtil.getDate(0)` |
| Future date (n days out) | `RandomUtil.getDate(n)` |

**Exception:** Stable system constants (certification codes like `"RN"`, fixed addresses used for driving-distance tests) may be hardcoded because they represent real system values, not test-created data.

---

## Rule 2 — `RandomUtil` API

```ts
import { RandomUtil } from "../../../utils/RandomUtil";

RandomUtil.generateRandomString(7)        // "KXBPLMT"     — uppercase alpha only
RandomUtil.generateRandomAlphaNumeric(10) // "A3kF9pZm2T"  — mixed case + digits
RandomUtil.generateRandomNumber(6)        // "847291"       — digits only
RandomUtil.getDate(0)                     // "6/1/2026"     — M/D/YYYY, no zero-padding
RandomUtil.getDate(5)                     // "6/6/2026"     — 5 days from today
```

---

## Rule 3 — Load users from `users.json`

```ts
const users = require("../../../test-data/users.json");
// Keys: defaultUser, validUser1, validUser2, validUser3, validUser4, validUser5, validUser6

await loginPage.login(users.validUser2.username, users.validUser2.password);
```

Never inline credentials. For the full user → role → auth-file mapping, see `storage-state-authentication` SKILL.md.

---

## Rule 4 — Ambient global types — no import needed

Types in `test-data/Types.ts` are ambient globals. Adding an `import` statement for them causes a compile error.

```ts
// Available everywhere without import:

// API payload types
insertOrderPayload        // customerID?, status?, userId?, nursetype?, specialty?,
                          // jobDateStart?, jobDateEnd?, shiftStartTime?, shiftEndTime?,
                          // shiftType?, shiftNum?, filledBy?, resultType?
insertTempRecordsPayload  // firstName?, lastName?, homeRegion?, status?, certification?,
                          // specialty?, address?, city?, state?, zip?, paySchedule?, tempType?
insertClientsPayload      // clientName?, address?, city?, state?, zip?, status?, regionId?
getCertsPayload           // certNameLike?, resultType?

// Record types (returned by read methods)
TempRecord     // { tempId: string; firstName?: string; lastName?: string }
ClientRecord   // { clientId: string; clientname?: string }
OrderRecord    // { orderId: string }
CertRecord     // { certName: string }

// UI payload types
TempData       // firstname?, lastname?, address?, city?, state?, zip?, status?,
               // homeRegion?, contract_or_ee?, certification?, speciality?
TempUpdateData // EligibleForDailyPay?, DailyPayAdvancePercentage?
```

```ts
// Good — use directly
const payload: insertOrderPayload = { customerID: testState.clientId, status: "Open" };

// Bad — this import path does not exist and will fail
import { insertOrderPayload } from "../../../test-data/Types";
```

---

## Rule 5 — `TestState` lifecycle

`TestState` starts empty (`{}`) for each test and is populated as a side-effect of API insert calls and UI page object methods.

### Shape

```ts
type TestState = {
  tempId?: string;
  temp_firstName?: string;
  temp_lastName?: string;
  clientId?: string;
  clientName?: string;
  orderId?: string;
  fileName?: string;
};
```

### What populates each field

| Field(s) | Populated by |
|----------|-------------|
| `tempId`, `temp_firstName`, `temp_lastName` | `clearConnectAPI.insertTempRecords()` or `tempPage.createNewTemp()` |
| `clientId`, `clientName` | `clearConnectAPI.insertClients()` or `clientPage.createNewClient()` |
| `orderId` | `clearConnectAPI.insertOrder()` or `orderPage.createNewOrder()` |
| `fileName` | `reportPage.download*Report()` |

### Usage pattern

Always `await` inserts, then guard the ID before using it:

```ts
await clearConnectAPI.insertTempRecords({
  firstName: RandomUtil.generateRandomString(7),
  lastName: RandomUtil.generateRandomString(7),
});
expect(testState.tempId).toBeTruthy();          // guard — surfaces silent API failures early

await clearConnectAPI.insertClients({ clientName: RandomUtil.generateRandomString(8) });
expect(testState.clientId).toMatch(/^\d+$/);    // guard

await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
await clearConnectAPI.insertOrder({ customerID: testState.clientId, ... });
```

**`testState` is per-test only** — never read values set by a different test. It is wired into all page objects at fixture time — do not pass it manually.

---

## Rule 6 — Static strings from `AllverificationData.ts`

Import repeated UI text from `AllverificationData.ts` rather than inlining it per test:

```ts
import { mainMenuQuickLinkText } from "../../../test-data/AllverificationData";
for (const text of Object.values(mainMenuQuickLinkText)) {
  await loginPage.verifyQuickLinkText(text);
}
```

Pass `paySchedule` values as string names to `insertTempRecords` — the API layer resolves the enum internally:

```ts
await clearConnectAPI.insertTempRecords({ paySchedule: "Weekly", ... });
// "Weekly" → paySchedule.Weekly → "1" internally
```

---

## Rule 7 — Data-driven tests

Iterate with `forEach` on exported arrays. Each iteration produces a separately named test entry in the report:

```ts
import { multipleClientData } from "../../../test-data/MultipleClientData";

multipleClientData.forEach((data) => {
  test(`@regression Create client for ${data.city}, ${data.state}`, async ({ loginPage, clientPage }) => {
    await loginPage.defaultLogin();
    await loginPage.navigateToPage("clientmanager.cfm");
    await clientPage.createNewClient({
      clientname: RandomUtil.generateRandomString(7),  // random per iteration
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
    });
  });
});
```

Add new data sets to `test-data/MultipleClientData.ts` — never use inline arrays inside test files.

---

## Quick checklist

- [ ] No hardcoded names, IDs, or dates — all dynamic values use `RandomUtil`
- [ ] No inline credentials — loaded from `users.json` via `require`
- [ ] No `import` of types from `test-data/Types.ts` — they are ambient globals
- [ ] Every `clearConnectAPI` insert is `await`ed and the resulting `testState` ID is guarded
- [ ] `testState` values are never shared across tests
- [ ] Repeated UI strings come from `AllverificationData.ts`, not inlined per test
- [ ] Data-driven sets use `forEach` on exported arrays, not inline arrays in test files
