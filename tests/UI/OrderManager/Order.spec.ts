import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";
const users = require("../../../test-data/users.json");

test.setTimeout(60_000);

test.beforeEach(async ({ loginPage, clearConnectAPI }) => {
  await loginPage.login(users.validUser3.username, users.validUser3.password);
  await loginPage.verifySuccessfulLogin();
});

test.afterEach(async ({ commonPage}) => {
  await commonPage.deleteAllFilessInDownloadsFolder();
});

test("@regression Create a new order", async ({
  page,
  loginPage,
  tempPage,
  clientPage,
  orderPage,
  testState
}) => {
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
  await loginPage.navigateToPage("ordermanager-legacy.cfm");
  await orderPage.createNewOrder(RandomUtil.getDate(5), "8D (1)", "RN", "ER");
});

test("@regression Create a filled order", async ({
  page,
  loginPage,
  tempPage,
  clientPage,
  clearConnectAPI,
  testState,
}) => {
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
});

test("@regression Reconcile filled order", async ({
  page,
  loginPage,
  tempPage,
  clientPage,
  clearConnectAPI,
  testState,
}) => {
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
});

test("@regression Download Profitability Report", async ({
  clearConnectAPI,
  testState,
  timecardPage,
  reportPage,
  cleanupDownloads
}) => {
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
    await timecardPage.closeTimecardPopup();
    await reportPage.navigateToReportPage();
    await reportPage.downloadProfitabilityReport(testState.temp_firstName);
});
