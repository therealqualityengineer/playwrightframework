import { test, expect } from "../../fixtures/testFixture";
import { RandomUtil } from "../../utils/RandomUtil";
const users = require("../../test-data/users.json");

test.setTimeout(120_000);

test("@api Verify API method getTemps ", async ({
  loginPage,
  tempPage,
  page,
  clearConnectAPI,
  testState,
}) => {
  await loginPage.login(users.validUser4.username, users.validUser4.password);
  await loginPage.verifySuccessfulLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
  });
  const response = await clearConnectAPI.getTemps(testState.tempId ?? "");
  const tempId = response[0]?.tempId;
  console.log("Retrieved Temp ID from API:", tempId);
  expect(tempId).toBe(testState.tempId);
});

test("@api Verify API method insertOrder", async ({
  loginPage,
  clientPage,
  clearConnectAPI,
  testState,
}) => {
  await loginPage.login(users.validUser4.username, users.validUser4.password);
  await loginPage.verifySuccessfulLogin();
  await loginPage.navigateToPage("clientmanager.cfm");
  await clientPage.createNewClient({
    clientname: RandomUtil.generateRandomString(10),
    quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
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
  console.log("API Response for insertOrder:", responseBody);
  expect(responseBody[0]?.orderId).toBeTruthy();
  testState.orderId = responseBody[0]?.orderId;
  console.log("Created Order ID from API:", testState.orderId);
});

test("@api Verify API method getOrders", async ({
  loginPage,
  clientPage,
  clearConnectAPI,
  testState,
}) => {
  await loginPage.login(users.validUser4.username, users.validUser4.password);
  await loginPage.verifySuccessfulLogin();
  await loginPage.navigateToPage("clientmanager.cfm");
  await clientPage.createNewClient({
    clientname: RandomUtil.generateRandomString(10),
    quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
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
  console.log("Retrieved Order ID from API:", orderId);
  expect(orderId).toBe(testState.orderId);
});

test("@api Verify API method getClients", async ({
  loginPage,
  clientPage,
  clearConnectAPI,
  testState,
}) => {
  await loginPage.login(users.validUser4.username, users.validUser4.password);
  await loginPage.verifySuccessfulLogin();
  await loginPage.navigateToPage("clientmanager.cfm");
  await clientPage.createNewClient({
    clientname: RandomUtil.generateRandomString(10),
    quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
  });
  expect(testState.clientId).toMatch(/^\d+$/);
  const response = await clearConnectAPI.getClients(testState.clientId ?? "");
  const clientId = response[0]?.clientId;
  console.log("Retrieved Client ID from API:", clientId);
  expect(clientId).toBe(testState.clientId);
});
