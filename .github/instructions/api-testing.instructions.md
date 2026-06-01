---
applyTo: "tests/API/**/*.spec.ts"
---

# API Testing Instructions

These instructions apply to all Playwright API test files under `tests/API/`.

## Imports and fixture usage

Always import `test` and `expect` from the fixture, never directly from `@playwright/test`:

```ts
import { test, expect } from "../../fixtures/testFixture";
import { RandomUtil } from "../../utils/RandomUtil";
```

Destructure only the fixtures the test actually uses. API tests typically need `clearConnectAPI` and `testState`:

```ts
test("@api ...", async ({ clearConnectAPI, testState }) => { ... });
```

## Test tag

All API tests must use the `@api` tag at the start of the test title:

```ts
test("@api Verify API method getTemps", async ({ ... }) => { ... });
```

Run only API tests with `npm run api`.

## Timeout

Add `test.setTimeout(120_000)` at the top of every API test file — API calls can be slow and the default timeout is too short.

## Authentication — do not manage tokens manually

Authentication is handled automatically by `SessionManager`. It lazily generates a Bearer token using `API_USERNAME` and `API_PASSWORD` from the environment, caches it as a static property, and re-generates it only when the session is invalid.

Never call `SessionManager` directly from a test. Always go through the `clearConnectAPI` fixture, which calls `authHeader()` internally before every request.

## ClearConnect API methods

All requests go through `ClearConnectAPI` (`pages/ClearConnectAPI.ts`). The base URL is fixed — do not construct raw `request` calls in tests.

### Insert methods (write `testState` as a side-effect)

| Method | Payload type | `testState` fields populated |
|--------|-------------|------------------------------|
| `insertTempRecords(payload)` | `insertTempRecordsPayload` | `tempId`, `temp_firstName`, `temp_lastName` |
| `insertClients(payload)` | `insertClientsPayload` | `clientId`, `clientName` |
| `insertOrder(payload)` | `insertOrderPayload` | `orderId` |

All payload fields are optional — provide only what differs from the defaults baked into `ClearConnectAPI`.

### Read methods (return typed arrays)

| Method | Params | Return type |
|--------|--------|-------------|
| `getTemps(tempIdIn)` | string | `TempRecord[]` |
| `getClients(clientIdIn)` | string | `ClientRecord[]` |
| `getOrders(orderId)` | string | `OrderRecord[]` |
| `getCerts(payload)` | `getCertsPayload` | `CertRecord[]` |

Each read method already asserts `response.status() === 200` internally. Do not duplicate that assertion in tests.

## Payload types

Global payload and record types from `test-data/Types.ts` are **ambient globals** — no import needed:

- `insertOrderPayload`, `insertTempRecordsPayload`, `insertClientsPayload`, `getCertsPayload`
- `TempRecord`, `ClientRecord`, `OrderRecord`, `CertRecord`

## Typical test pattern

Seed data, then read it back and assert on the returned IDs or fields:

```ts
test("@api Verify API method getTemps", async ({ clearConnectAPI, testState }) => {
  await clearConnectAPI.insertTempRecords({
    firstName: RandomUtil.generateRandomString(7),
    lastName: RandomUtil.generateRandomString(7),
  });
  const response = await clearConnectAPI.getTemps(testState.tempId ?? "");
  expect(response[0]?.tempId).toBe(testState.tempId);
});
```

When a method depends on a prior insert, chain them in order and use `testState` to pass IDs:

```ts
await clearConnectAPI.insertClients({ clientName: RandomUtil.generateRandomString(10) });
expect(testState.clientId).toMatch(/^\d+$/);   // guard before using the ID

await clearConnectAPI.insertOrder({ customerID: testState.clientId, ... });
expect(testState.orderId).toBeTruthy();
```

## Test data

Use `RandomUtil` for all dynamic values:

```ts
RandomUtil.generateRandomString(7)        // alpha string
RandomUtil.generateRandomAlphaNumeric(10) // alphanumeric string
RandomUtil.getDate(0)                     // today's date; offset > 0 for future dates
```

Never hardcode names, IDs, or dates in test payloads.

## Assertions

- Assert `testState` IDs immediately after an insert to catch silent failures early (e.g. `expect(testState.clientId).toMatch(/^\d+$/)`).
- Assert returned array length and specific field values — not just that the response is truthy.
- Do not re-assert HTTP status; `ClearConnectAPI` methods already do that.

## What not to do

- **No raw `request` calls** in tests — always use the `clearConnectAPI` fixture.
- **No manual token handling** — `SessionManager` manages the session lifecycle.
- **No hardcoded values** for names, IDs, or dates — use `RandomUtil`.
- **No `test.only`** — remove before merging.
- **No `waitForTimeout`** — API tests are request/response; no polling or sleep needed.
- **Do not add `resultType` to payloads** unless you need XML — `"json"` is already the default.
