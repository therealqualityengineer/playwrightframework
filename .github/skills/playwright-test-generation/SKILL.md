# Skill: Playwright Test Generation

## Purpose

Generate complete, production-ready Playwright `.spec.ts` tests for the CTMS framework. This skill owns the `test.step()` structure, the page object reference, and the authoritative pre-output checklist. All general rules (imports, timeout, auth patterns, API seeding, tags, cleanup) are defined in the instruction files — read them first.

---

## Instruction files to read first

| File | Read when |
|------|-----------|
| `.github/instructions/test-generation.instructions.md` | Every request — imports, auth, seeding, tags, templates |
| `.github/instructions/ui-testing.instructions.md` | Target is under `tests/UI/` |
| `.github/instructions/api-testing.instructions.md` | Target is under `tests/API/` |
| `.github/instructions/flaky-tests.instructions.md` | Always — anti-patterns to avoid |

Also read the relevant page object in `pages/` and any existing spec in the target directory before writing a single line.

---

## `test.step()` — required in every test

Every test body must group its actions into named `test.step()` blocks. This makes Allure and HTML reports readable and pinpoints failures precisely. It is not optional.

### Naming convention

| Phase | Pattern | Example |
|-------|---------|---------|
| Data setup | `Seed …` | `'Seed temp and client via API'` |
| Auth + navigation | `Login and navigate to …` | `'Login and navigate to order manager'` |
| User action | Verb + subject | `'Enable flat pay and bill'`, `'Upload timecard image'` |
| Assertion | `Verify …` | `'Verify auto pay is disabled'` |

### Rules

- Every logical phase gets its own step: seed → navigate → act → verify.
- Assertions belong only in `'Verify …'` steps — never inside action steps.
- Group at least 2–3 related lines per step. Do not make a step for a single obvious one-liner.
- Step names must be unique within a test.
- The final step is always `'Verify …'` and must contain at least one specific assertion.

### Example

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

## Page object quick reference

Do not write raw `page.locator()` or `page.click()` calls in test files — all interactions go through page object methods. Check the relevant page object in `pages/` before adding a new method.

| Fixture | Key methods |
|---------|------------|
| `loginPage` | `defaultLogin()`, `login(u,p)`, `navigateToPage(url)`, `verifySuccessfulLogin()`, `verifyQuickLinkText(text)` |
| `tempPage` | `navigateToCreateTemp()`, `createNewTemp(TempData)`, `enableFlatPayBill(pay,bill)`, `verifyAutoPayDisplaysDisabled()`, `enableAutoPayAndVerifyFlatPayDisabled()`, `updateTemp(TempUpdateData)`, `clickFacilitiesTab()`, `selectRegionInFacilities(region)`, `selectClientForFacilities(name)`, `clickFacilitiesFilterButton()`, `verifyClientFilteredInFacilities(name)`, `clickGetDrivingDistance()`, `verifyDrivingDistanceAndTime()`, `getDrivingDistanceMiles()` |
| `clientPage` | `createNewClient(ClientData)` |
| `orderPage` | `createNewOrder(jobDate, shift, certs, speciality)` |
| `timecardPage` | `reconcileTimecard(orderId, imageOption)`, `postTimecard()`, `dailyPay()`, `closeTimecardPopup()` |
| `reportPage` | `navigateToReportPage()`, `downloadProfitabilityReport()`, `downloadTempProfilesReport()`, `downloadTempProfilesByCertificationReport()`, `downloadClientProfilesReport()`, `verifyDataInExcel(fileName, expectedData)` |
| `clearConnectAPI` | `insertTempRecords(payload)`, `insertClients(payload)`, `insertOrder(payload)`, `getTemps(id)`, `getClients(id)`, `getOrders(id)`, `getCerts(payload)` |

---

## Pre-output checklist — authoritative source

Verify every item before returning generated code. The agent's pre-output checklist defers to this list.

**Code quality**
- [ ] No `test.only` anywhere
- [ ] No `waitForTimeout` anywhere
- [ ] No hardcoded names, IDs, or dates — all dynamic values use `RandomUtil`
- [ ] No `import { test, expect } from '@playwright/test'` — fixture re-export only
- [ ] No `import` of types from `test-data/Types.ts` — they are ambient globals
- [ ] No raw `page.locator()` or `page.click()` calls in the test body

**Structure**
- [ ] Every test body has `test.step()` blocks
- [ ] The final step in every test is `'Verify …'` with at least one specific assertion
- [ ] Assertions are specific (value, ID, text content) — not just `.toBeVisible()` on an arbitrary element
- [ ] `test.setTimeout(120_000)` at file level when test has more than two steps or any API call
- [ ] `afterEach` with `void cleanupDownloads` when any test downloads a file

**Data and auth**
- [ ] Every `clearConnectAPI` insert is `await`ed and the `testState` ID is guarded before use
- [ ] `storageState` setup matches `storage-state-authentication` SKILL.md exactly when used
- [ ] Tag is `@smoke`, `@regression`, or `@api` — one per test, at the start of the title string

**File handling**
- [ ] If target file exists: output only the new test(s) — do not repeat existing code
- [ ] If target file is new: full file with correct import depth for its directory location
