# Copilot Instructions — PlaywrightFramework

Read and apply every rule here before writing any code. These rules take precedence over all other guidance.

---

## Framework overview

Playwright E2E framework targeting a live ColdFusion web app (CTMS/ClearConnect). Tests run headed against QA/UAT/Stage environments.

```
tests/UI/<Feature>/   — UI spec files (one per feature area)
tests/API/            — API-only specs
pages/                — Page Object Model classes extending BasePage
fixtures/             — Extended Playwright fixture (always import from here)
utils/RandomUtil.ts   — Dynamic data helpers
test-data/            — Static strings and payload types
```

---

## Imports — always required

```ts
import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";
```

- **Never** import `test` or `expect` from `@playwright/test`
- **Never** import types from `test-data/Types.ts` — they are ambient globals (`TempData`, `TempRecord`, etc.)

---

## Test structure — match the existing file

**Before writing anything, read every existing test in the target file.**

- If existing tests use `test.step()` — add steps with the same naming pattern
- If existing tests use flat sequential calls — use flat sequential calls
- **Do not impose `test.step()` on a file that does not already use it**

Every test must:
- Start with `loginPage.defaultLogin()` (unless the file uses `storageState` pre-auth)
- Use `RandomUtil` for all dynamic values — never hardcode names, IDs, or dates
- Have exactly one tag at the start of the title: `@smoke`, `@regression`, or `@api`
- **Never use `test.only`** — it silently skips all other tests in the file
- **Never use `waitForTimeout`** — rely on Playwright's built-in auto-waiting

---

## Page object design

### One selector — not a candidate array

Pick the single correct selector. If it does not work, fix the selector — do not add fallbacks:

```ts
// ✅ single authoritative selector
private facilitiesSaveButton = "input[value='save']";

// ❌ fallback array — hides the real problem
const candidates = ['#saveBtn', 'input[value="Save"]', 'input[value="save"]', ...];
for (const sel of candidates) { ... }
```

### Check BasePage before adding locators

`BasePage` already exposes these protected locators — do not redefine them in a subclass:

| Locator | Selector |
|---------|----------|
| `saveButton` | `#saveBtn` |
| `addressTextbox` | `[id='address']` |
| `cityTextbox` | `#city` |
| `stateTextbox` | `#state` |
| `zipTextbox` | `#zip` |
| `statusDropdown` | `[name='status']` |

**Important:** `saveButton` is the temp profile form's save button. Other pages use different buttons — add a page-specific private locator for those.

### One expected text per assertion

Pick the actual text the app produces — do not loop over guesses:

```ts
// ✅ one specific text
async verifyFacilitiesSuccess() {
  await this.ElementVisible("Facilities Successfully Updated.", "text");
}

// ❌ loop over multiple variants
const messages = ['Facilities Successfully Updated.', 'Successfully Updated', ...];
for (const m of messages) { ... }
```

### Use BasePage wrapper methods

All interactions go through `TypeText`, `Click`, `ElementVisible`, `SelectOption`, `TypeTextEnter`. Use raw `this.page.locator()` calls only when BasePage wrappers cannot support the interaction (e.g. chained locators for row-scoped elements or waiting for specific states).

### No networkidle with swallowed exceptions

```ts
// ✅ correct
await this.page.waitForLoadState("load");

// ❌ wrong
try {
  await this.page.waitForLoadState('networkidle', { timeout: 5000 });
} catch { /* ignore */ }
```

### No try/catch around selector failures

If a selector fails, it should fail loudly. Never catch and continue — the test must surface the real problem.

---

## Comments — write none by default

Only add a comment when the WHY is non-obvious (a hidden constraint, a subtle app behaviour, a workaround for a specific bug). Never write comments that explain WHAT the code does.

---

## Pre-write checklist

Before returning any code:

- [ ] No `test.only`
- [ ] No `waitForTimeout`
- [ ] No hardcoded names, IDs, or dates
- [ ] No `import` from `@playwright/test`
- [ ] No fallback selector arrays or multi-text loops
- [ ] No `networkidle` waits wrapped in try/catch
- [ ] No comments explaining WHAT — only WHY when truly non-obvious
- [ ] Test structure matches the existing tests in the target file
- [ ] BasePage locators checked before defining new ones in a subclass
