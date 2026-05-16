import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";
const users = require("../../../test-data/users.json");

test.setTimeout(180_000);

test("@regression Reconcile filled order", async ({
  page,
  loginPage,
  tempPage,
  clientPage,
  clearConnectAPI,
  timecardPage,
  testState,
}) => {
  await loginPage.login(users.validUser5.username, users.validUser5.password);
  await loginPage.verifySuccessfulLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
  });
  await loginPage.navigateToPage("clientmanager.cfm");
  await clientPage.createNewClient({
    clientname: RandomUtil.generateRandomString(10),
    quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
  });
  expect(testState.clientId).toMatch(/^\d+$/);
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

test("@regression Reconcile filled order with timecard image", async ({
  page,
  loginPage,
  tempPage,
  clientPage,
  clearConnectAPI,
  timecardPage,
  testState,
}) => {
  await loginPage.login(users.validUser5.username, users.validUser5.password);
  await loginPage.verifySuccessfulLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
  });
  await loginPage.navigateToPage("clientmanager.cfm");
  await clientPage.createNewClient({
    clientname: RandomUtil.generateRandomString(10),
    quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
  });
  expect(testState.clientId).toMatch(/^\d+$/);
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

test("@regression Reconcile and Post Timecard", async ({
  page,
  loginPage,
  tempPage,
  clientPage,
  clearConnectAPI,
  timecardPage,
  testState,
}) => {
  await loginPage.login(users.validUser5.username, users.validUser5.password);
  await loginPage.verifySuccessfulLogin();
  await clearConnectAPI.insertTempRecords({
    firstName: RandomUtil.generateRandomString(7),
    lastName: RandomUtil.generateRandomString(7),
  });
  await clearConnectAPI.insertClients({
    clientName: RandomUtil.generateRandomString(7),
  });
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
  await timecardPage.reconcileTimecard(testState.orderId ?? "", "withoutImage");
  await timecardPage.postTimecard(testState.orderId ?? "");
});
