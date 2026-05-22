import { test, expect } from "../../fixtures/testFixture";
import { RandomUtil } from "../../utils/RandomUtil";

test.setTimeout(120_000);

test("@api Verify API method getTemps ", async ({
  clearConnectAPI,
  testState,
}) => {
  await clearConnectAPI.insertTempRecords({
    firstName: RandomUtil.generateRandomString(7),
    lastName: RandomUtil.generateRandomString(7),
  });
  const response = await clearConnectAPI.getTemps(testState.tempId ?? "");
  const tempId = response[0]?.tempId;
  expect(tempId).toBe(testState.tempId);
});

test("@api Verify API method insertOrder", async ({
  clearConnectAPI,
  testState,
}) => {
  await clearConnectAPI.insertClients({
    clientName: RandomUtil.generateRandomString(10),
  });
  expect(testState.clientId).toMatch(/^\d+$/);
  const responseBody = await clearConnectAPI.insertOrder({
    customerID: testState.clientId,
    status: "Open",
    userId: "1",
    nursetype: "RN",
    specialty: "ER",
    jobDateStart: RandomUtil.getDate(0),
    jobDateEnd: RandomUtil.getDate(0),
    shiftStartTime: "07:00",
    shiftEndTime: "15:00",
    shiftType: "Regular",
    shiftNum: "1",
    resultType: "json",
  });
  expect(responseBody[0]?.orderId).toBeTruthy();
});

test("@api Verify API method getOrders", async ({
  clearConnectAPI,
  testState,
}) => {
  await clearConnectAPI.insertClients({
    clientName: RandomUtil.generateRandomString(10),
  });
  expect(testState.clientId).toMatch(/^\d+$/);
  const insertResponse = await clearConnectAPI.insertOrder({
    customerID: testState.clientId,
    status: "Open",
    userId: "1",
    nursetype: "RN",
    specialty: "ER",
    jobDateStart: RandomUtil.getDate(0),
    jobDateEnd: RandomUtil.getDate(0),
    shiftStartTime: "07:00",
    shiftEndTime: "15:00",
    shiftType: "Regular",
    shiftNum: "1",
    resultType: "json",
  });
  expect(insertResponse[0]?.orderId).toBeTruthy();
  const orderResponse = await clearConnectAPI.getOrders(testState.orderId ?? "");
  const orderId = orderResponse[0]?.orderId;
  expect(orderId).toBe(testState.orderId);
});

test("@api Verify API method getClients", async ({
  clearConnectAPI,
  testState,
}) => {
  await clearConnectAPI.insertClients({
    clientName: RandomUtil.generateRandomString(10),
  });
  expect(testState.clientId).toMatch(/^\d+$/);
  const response = await clearConnectAPI.getClients(testState.clientId ?? "");
  const clientId = response[0]?.clientId;
  expect(clientId).toBe(testState.clientId);
});

test("@api Verify API method getCerts", async ({
  clearConnectAPI,
}) => {
  const response = await clearConnectAPI.getCerts({ certNameLike: "RN" });
  expect(Array.isArray(response)).toBeTruthy();
  expect(response.length).toBeGreaterThan(0);
  const certName = response[0]?.certName;
  expect(certName).toBeTruthy();
  expect(certName.toUpperCase()).toContain("RN");
});
