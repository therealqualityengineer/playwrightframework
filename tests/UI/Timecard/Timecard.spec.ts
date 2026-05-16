import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";
const users = require("../../../test-data/users.json");

test.describe("Timecard Reconciliation and Posting Using UI", () => {
  test.beforeEach(async ({ loginPage, clearConnectAPI }) => {
    await loginPage.login(users.validUser5.username, users.validUser5.password);
    await loginPage.verifySuccessfulLogin();
    await clearConnectAPI.insertTempRecords({
        firstName: RandomUtil.generateRandomString(7),
        lastName: RandomUtil.generateRandomString(7),
    });
    await clearConnectAPI.insertClients({
        clientName: RandomUtil.generateRandomString(7),
      });
  });

  test("@regression Reconcile filled order", async ({clearConnectAPI, testState, timecardPage}) => {
    const responseBody = await clearConnectAPI.insertOrder({
    customerID: testState.clientId,
    status: "Filled",
    userId: "1",
    nursetype: "RN",
    specialty: "ER",
    jobDateStart: RandomUtil.getDate(0),
    jobDateEnd: RandomUtil.getDate(0),
    shiftStartTime: "07:00",
    shiftEndTime: "15:00",
    shiftType: "Regular",
    shiftNum: "1",
    filledBy: testState.tempId,
    resultType: "json",
  });
  expect(responseBody[0]?.orderId).toBeTruthy();
  testState.orderId = responseBody[0]?.orderId;
  console.log("Created Order ID from API:", testState.orderId);
  await timecardPage.reconcileTimecard(testState.orderId ?? "", "withoutImage");
  });

  test("@regression Reconcile filled order with timecard image", async ({clearConnectAPI, testState, timecardPage}) => {
    const responseBody = await clearConnectAPI.insertOrder({
    customerID: testState.clientId,
    status: "Filled",
    userId: "1",
    nursetype: "RN",
    specialty: "ER",
    jobDateStart: RandomUtil.getDate(0),
    jobDateEnd: RandomUtil.getDate(0),
    shiftStartTime: "07:00",
    shiftEndTime: "15:00",
    shiftType: "Regular",
    shiftNum: "1",
    filledBy: testState.tempId,
    resultType: "json",
  });
  expect(responseBody[0]?.orderId).toBeTruthy();
  testState.orderId = responseBody[0]?.orderId;
  console.log("Created Order ID from API:", testState.orderId);
  await timecardPage.reconcileTimecard(testState.orderId ?? "", "withImage");  
  });
});

test.describe("Timecard Posting Using UI", () => {
    test.beforeEach(async ({ loginPage, clearConnectAPI}) => {
      await loginPage.login(users.validUser5.username, users.validUser5.password);
      await loginPage.verifySuccessfulLogin();
      await clearConnectAPI.insertTempRecords({
        firstName: RandomUtil.generateRandomString(7),
        lastName: RandomUtil.generateRandomString(7),
      });
      await clearConnectAPI.insertClients({
        clientName: RandomUtil.generateRandomString(7),
      });
    });

    test("@regression Post Timecard", async ({clearConnectAPI, testState, timecardPage}) => {
      await clearConnectAPI.insertOrder({
        customerID: testState.clientId,
        status: "Filled",
        userId: "1",
        nursetype: "RN",
        specialty: "ER",
        jobDateStart: RandomUtil.getDate(0),
        jobDateEnd: RandomUtil.getDate(0),
        shiftStartTime: "07:00",
        shiftEndTime: "15:00",
        shiftType: "Regular",
        shiftNum: "1",
        filledBy: testState.tempId,
        resultType: "json",
  });
  await timecardPage.reconcileTimecard(testState.orderId ?? "", "withImage");
  await timecardPage.postTimecard(testState.orderId ?? "");
    });
});

