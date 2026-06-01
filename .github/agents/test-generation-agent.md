# Agent: Test Generation

## Description

Generates production-ready Playwright `.spec.ts` tests for the CTMS framework. Accepts a structured YAML request, reads the relevant codebase files, applies the correct skills, and outputs a complete test following all framework conventions.

---

## Skills used

| Skill | When applied |
|-------|-------------|
| `.github/skills/playwright-test-generation/SKILL.md` | Every request — `test.step()` structure, page object reference, pre-output checklist |
| `.github/skills/storage-state-authentication/SKILL.md` | When `storageState` is in `Instructions` or inferred from `User` field |
| `.github/skills/test-data-management/SKILL.md` | Every request — `RandomUtil`, ambient types, `TestState` |

## Instruction files consulted

| File | Applies when |
|------|-------------|
| `.github/instructions/test-generation.instructions.md` | All requests — imports, timeout, auth patterns, seeding, tags |
| `.github/instructions/ui-testing.instructions.md` | `Target File` is under `tests/UI/` |
| `.github/instructions/api-testing.instructions.md` | `Target File` is under `tests/API/` |
| `.github/instructions/flaky-tests.instructions.md` | Always — anti-patterns to avoid in generated code |

## Files to read before generating

1. `fixtures/testFixture.ts` — fixture types and `TestState` shape
2. `pages/BasePage.ts` — shared locators and wrapper methods
3. The page object for the target feature — reuse methods, do not duplicate
4. `test-data/users.json` — available user keys
5. Any existing spec file in the target directory — match the established structure

---

## Input format

```yaml
Target File: tests/UI/TempManager/TempProfile.spec.ts   # required
Test Title: Update temp home region                       # required — no tag in this field
Tag: @regression                                          # required — @smoke | @regression | @api

Instructions:                                             # optional — overrides/extends defaults
  - Use API setup instead of UI creation
  - Use storageState authentication

Steps:                                                    # optional — maps to test.step() blocks
  - Navigate to the temp profile using the tempId
  - Change the Home Region dropdown to "West"
  - Click Save
  - Verify success message is visible

Assert:                                                   # optional — becomes the final Verify step
  Success toast/message visible after save

User:                                                     # optional — key from users.json
  validUser3                                              # omit to use defaultLogin()
```

### Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `Target File` | Yes | Full path — determines feature area, import depth, directory |
| `Test Title` | Yes | Human-readable title without tag — agent prepends `Tag` |
| `Tag` | Yes | `@smoke`, `@regression`, or `@api` — one per test |
| `Instructions` | No | Free-form directives that override or extend defaults |
| `Steps` | No | Ordered user actions — each maps to a `test.step()` block |
| `Assert` | No | Observable outcome — becomes the final `'Verify …'` step |
| `User` | No | `users.json` key. Omit for `defaultLogin()`. Combine with `storageState` instruction for `beforeAll`. |

---

## Decision logic

### Auth pattern

| Condition | Pattern |
|-----------|---------|
| `User` omitted, `storageState` not in `Instructions` | `defaultLogin()` in each test |
| `User` specified, `storageState` not in `Instructions` | `loginPage.login(users.<key>...)` in each test |
| `storageState` in `Instructions` | `beforeAll` + `test.use()` — apply `storage-state-authentication` SKILL |

### Data seeding

| Condition | Pattern |
|-----------|---------|
| `Instructions` includes "API setup" or "API seeding" | `clearConnectAPI.insert*()` in test body or `beforeEach` |
| `Steps` describe UI creation and test is validating that flow | Page object create method |
| No instruction given | Default to API seeding for all prerequisite records |

### File handling

| Condition | Action |
|-----------|--------|
| `Target File` already exists | Add new test only — preserve all existing imports and structure |
| `Target File` does not exist | Create new file with correct import depth for its directory |
| Test downloads a file | Add `afterEach` with `void cleanupDownloads` |

---

## Generation procedure

1. Parse the YAML input and extract all fields.
2. Read all files listed in "Files to read before generating".
3. Resolve auth pattern, seeding strategy, and fixture list from the decision logic.
4. Read `playwright-test-generation` SKILL — apply `test.step()` naming rules and structure.
5. Read `test-data-management` SKILL — apply `RandomUtil`, ambient types, `TestState` guards.
6. If storageState: read `storage-state-authentication` SKILL — apply `beforeAll` + `test.use()`.
7. Map each `Steps` entry to a page object method call inside a named `test.step()` block.
8. Write the final `'Verify …'` step from the `Assert` field with a specific assertion.
9. Run the pre-output checklist from `playwright-test-generation` SKILL before returning code.

---

## Worked examples

### Example 1 — API-seeded UI test with `defaultLogin`

**Input:**
```yaml
Target File: tests/UI/TempManager/TempProfile.spec.ts
Test Title: Enable flat pay and verify auto pay is disabled
Tag: @regression
Steps:
  - Seed a temp record via API
  - Navigate to the temp pay page
  - Enable flat pay with pay=55, bill=125
  - Verify auto pay shows as disabled
Assert: Auto pay status cell displays "Disabled"
```

**Output:**
```ts
test("@regression Enable flat pay and verify auto pay is disabled", async ({
  loginPage,
  clearConnectAPI,
  testState,
  tempPage,
}) => {
  await test.step("Seed temp record via API", async () => {
    await clearConnectAPI.insertTempRecords({
      firstName: RandomUtil.generateRandomString(7),
      lastName: RandomUtil.generateRandomString(7),
    });
    expect(testState.tempId).toBeTruthy();
  });

  await test.step("Navigate to temp profile", async () => {
    await loginPage.defaultLogin();
    await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
  });

  await test.step("Enable flat pay with pay=55 and bill=125", async () => {
    await tempPage.enableFlatPayBill(55, 125);
  });

  await test.step("Verify auto pay is disabled", async () => {
    await tempPage.verifyAutoPayDisplaysDisabled();
  });
});
```

---

### Example 2 — `storageState` + API seeding

**Input:**
```yaml
Target File: tests/UI/OrderManager/Order.spec.ts
Test Title: Create a filled order and verify orderId is assigned
Tag: @regression
Instructions:
  - Use storageState authentication
  - Use API setup instead of UI creation
User: validUser3
Assert: testState.orderId is a non-empty numeric string
```

**Output:**
```ts
// Added to existing Order.spec.ts — beforeAll and test.use already present

test("@regression Create a filled order and verify orderId is assigned", async ({
  clearConnectAPI,
  testState,
}) => {
  await test.step("Seed temp and client via API", async () => {
    await clearConnectAPI.insertTempRecords({
      firstName: RandomUtil.generateRandomString(7),
      lastName: RandomUtil.generateRandomString(7),
    });
    await clearConnectAPI.insertClients({ clientName: RandomUtil.generateRandomString(10) });
    expect(testState.tempId).toBeTruthy();
    expect(testState.clientId).toMatch(/^\d+$/);
  });

  await test.step("Insert filled order via API", async () => {
    const responseBody = await clearConnectAPI.insertOrder({
      customerID: testState.clientId,
      status: "Filled",
      filledBy: testState.tempId,
      jobDateStart: RandomUtil.getDate(0),
      jobDateEnd: RandomUtil.getDate(0),
      shiftStartTime: "07:00",
      shiftEndTime: "15:00",
      shiftType: "Regular",
      shiftNum: "1",
    });
    expect(responseBody[0]?.orderId).toBeTruthy();
    testState.orderId = responseBody[0]?.orderId;
  });

  await test.step("Verify orderId is a numeric string", async () => {
    expect(testState.orderId).toMatch(/^\d+$/);
  });
});
```

---

### Example 3 — Pure API test

**Input:**
```yaml
Target File: tests/API/ClearConnect.spec.ts
Test Title: Verify getClients returns the inserted client
Tag: @api
Assert: response[0].clientId equals testState.clientId
```

**Output:**
```ts
test("@api Verify getClients returns the inserted client", async ({
  clearConnectAPI,
  testState,
}) => {
  await test.step("Insert client via API", async () => {
    await clearConnectAPI.insertClients({ clientName: RandomUtil.generateRandomString(10) });
    expect(testState.clientId).toMatch(/^\d+$/);
  });

  await test.step("Verify getClients returns the correct ID", async () => {
    const response = await clearConnectAPI.getClients(testState.clientId ?? "");
    expect(response[0]?.clientId).toBe(testState.clientId);
  });
});
```

---

## Pre-output checklist

The full checklist is in `.github/skills/playwright-test-generation/SKILL.md`. Before returning code, verify these agent-specific items:

- [ ] Every test body uses `test.step()` blocks with a final `'Verify …'` step
- [ ] Each `Steps` field entry is mapped — none silently dropped
- [ ] If `Target File` exists: only the new test is output — no existing code repeated
- [ ] If `storageState`: `beforeAll` path and `test.use()` path are identical strings
- [ ] Tag matches the input `Tag` field exactly and is at the start of the title string
