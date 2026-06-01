---
applyTo: "tests/**/*.spec.ts,pages/**/*.ts"
---

# Flaky Test Fixing Instructions

This guide documents the known flakiness patterns in this Playwright framework and how to fix each one. All fixes work within the existing framework conventions — no `waitForTimeout`, no retries added in test code.

---

## 1. Popup timing: `waitForEvent('popup')` called after the click

**Symptom:** `Error: Page.waitForEvent: Target closed` or popup reference is undefined.

**Cause:** The popup event fires at the moment the new window opens. If `waitForEvent` is registered after the click, the event is already gone.

**Fix:** Always set up the promise *before* the action that triggers it:

```ts
// Wrong — popup may open before waitForEvent is registered
await page.click(trigger);
const popup = await page.waitForEvent('popup');

// Correct
const popupPromise = page.waitForEvent('popup', { timeout: 10000 });
await page.click(trigger);
const popup = await popupPromise;
await popup.waitForLoadState('domcontentloaded');
```

The same pattern applies to `filechooser` and `dialog` events.

---

## 2. Typeahead / autocomplete inputs not triggering suggestions

**Symptom:** Search results don't appear after filling a lookup field; the result locator times out.

**Cause:** `.fill()` sets the value directly without firing keyboard events, so autocomplete listeners never receive input.

**Fix:** Use `pressSequentially` with a small delay to simulate real typing:

```ts
await input.fill('');
await input.pressSequentially(searchText, { delay: 50 });
await searchButton.click();
await expect(result).toBeVisible({ timeout: 10000 });
```

If the first attempt fails (network lag, search index not ready), retry the fill + search sequence rather than increasing the timeout. See the `selectLookupValue` retry loop in `OrderPage` as the reference implementation.

---

## 3. Stale or missing `storageState` auth file

**Symptom:** Tests in `Order.spec.ts` or `Timecard.spec.ts` fail on the first assertion with a redirect to `login.cfm`.

**Cause:** The `playwright/.auth/<name>.json` file does not exist yet, or the session stored in it has expired.

**Fix:** The `beforeAll` block that generates the auth file must run before any test in the file uses `test.use({ storageState })`. Ensure:

1. The `playwright/.auth/` directory exists in the repo (it is gitignored but must be created locally).
2. `beforeAll` calls `loginPage.verifySuccessfulLogin()` before saving state — this catches a failed login early.
3. The `storageState` path in `test.use` exactly matches the path written in `beforeAll`.

```ts
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.login(users.validUser3.username, users.validUser3.password);
  await loginPage.verifySuccessfulLogin();               // fail fast if login broke
  await page.context().storageState({ path: 'playwright/.auth/orderUser.json' });
  await page.close();
});

test.use({ storageState: 'playwright/.auth/orderUser.json' });
```

---

## 4. Popup page not brought to front after switching contexts

**Symptom:** Actions on a popup page fail intermittently with `element is not visible` or `element is outside of the viewport`.

**Cause:** After interacting with a popup and returning to the parent page (or vice versa), the OS window focus may remain on the wrong page.

**Fix:** Call `bringToFront()` on the page you are about to interact with:

```ts
await popup.bringToFront();
// interact with popup
await parentPage.bringToFront();
// interact with parent
```

For popup pages that receive a `reload()` after file upload or other server-side updates, call `bringToFront()` after the reload:

```ts
await timecardPopupPage.page.reload();
await timecardPopupPage.page.bringToFront();
```

---

## 5. `waitForLoadState` mismatch after popup or navigation

**Symptom:** Assertions immediately after a popup opens or a navigation completes fail because the DOM is not ready.

**Cause:** `waitForLoadState()` defaults to `'load'`, which waits for all resources (images, scripts). For pages that load assets lazily, `'load'` can be too slow; for pages that render before all assets finish, `'domcontentloaded'` is sufficient.

**Fix:** Use `'domcontentloaded'` for popups (they are typically server-rendered and ready before all assets load), then assert on a specific visible element before interacting:

```ts
await popup.waitForLoadState('domcontentloaded');
await expect(popup.locator('#knownStableElement')).toBeVisible({ timeout: 15000 });
```

---

## 6. `testState` values not populated when used across hooks

**Symptom:** `testState.clientId` or `testState.tempId` is `undefined` in a test even though `beforeEach` calls the insert method.

**Cause:** `testState` is a per-test fixture object. Values set by the `clearConnectAPI` insert methods in `beforeEach` are available within the same test's execution. However, if `beforeEach` does not `await` the insert call, the values are not populated by the time the test body runs.

**Fix:** Always `await` every insert call in `beforeEach`:

```ts
test.beforeEach(async ({ clearConnectAPI }) => {
  await clearConnectAPI.insertTempRecords({ ... });   // must be awaited
  await clearConnectAPI.insertClients({ ... });       // must be awaited
});
```

Guard the value before using it to get a clear error if it is still missing:

```ts
expect(testState.clientId).toMatch(/^\d+$/);
```

---

## 7. Locator matches multiple elements without `.nth()` / `.first()`

**Symptom:** `strict mode violation` error — locator matches N elements.

**Cause:** A locator is not scoped narrowly enough and matches more than one element on the page (e.g. multiple rows in a table, repeated navigation links).

**Fix:** Use `.first()` or `.nth(index)` to be explicit:

```ts
await expect(page.getByText(clientName, { exact: false }).first()).toBeVisible({ timeout: 15000 });
```

`BasePage` methods (`Click`, `ElementVisible`, `TypeText`) all call `.nth(0)` internally for `"locator"` type — prefer these wrappers over raw locator calls in page objects to get consistent behaviour.

---

## 8. Modal not visible before interaction

**Symptom:** `fill()` or `click()` on a modal input throws because the modal is not yet rendered.

**Cause:** Modals animate open and the input is not interactive until the animation completes.

**Fix:** Wait for a stable element inside the modal to be visible before interacting:

```ts
await expect(this.page.locator(this.facilitiesModalSearchInput)).toBeVisible({ timeout: 10000 });
await this.TypeText(this.facilitiesModalSearchInput, clientName, 'locator');
```

---

## 9. File upload `filechooser` event missed

**Symptom:** `page.waitForEvent('filechooser')` times out.

**Cause:** Same race condition as popup events — the chooser must be registered before the click that opens it.

**Fix:**

```ts
const fileChooserPromise = popup.waitForEvent('filechooser', { timeout: 10000 });
await popup.locator('#uploadfile').click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles(filePath, { timeout: 15000 });
```

After the upload, wait for a visible confirmation element before closing the popup:

```ts
await expect(popup.locator('#add-btn')).toBeVisible({ timeout: 15000 });
await popup.close();
```

---

## 10. `headless: false` focus-sensitive failures

**Symptom:** Tests that pass headless fail headed (or vice versa) — typically dropdown selections, keyboard shortcuts, or focus-dependent widgets.

**Cause:** Headed mode with 4 workers means multiple browser windows compete for OS focus. Focus events may not fire on a window that is not in the foreground.

**Fix:**
- Use `bringToFront()` before any focus-sensitive interaction (see rule 4).
- Prefer `SelectOption` over keyboard-driven dropdown interaction — it does not require focus.
- For inputs that need keyboard events, use `pressSequentially` (which sends events directly to the element) rather than `keyboard.press` on the page object (which requires focus).

---

## 11. Adding `waitForTimeout` as a fix

**This is never the right fix.** `waitForTimeout` introduces a fixed delay that is either too short (still flaky) or too long (slow). Replace every occurrence with an explicit condition:

| Instead of | Use |
|------------|-----|
| `waitForTimeout(2000)` after a click | `expect(locator).toBeVisible({ timeout: 10000 })` |
| `waitForTimeout(1000)` before a fill | `expect(input).toBeEnabled({ timeout: 5000 })` |
| `waitForTimeout(3000)` after navigation | `waitForLoadState('domcontentloaded')` then assert a landmark |

---

## 12. `test.only` left in a file

**Symptom:** Entire test file appears to pass but only one test ran; other tests in the file are silently skipped.

**Fix:** Remove all `test.only` calls before merging. Search for them with:

```bash
grep -rn "test\.only" tests/
```
