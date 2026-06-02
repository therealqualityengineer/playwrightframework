import { test, expect } from "../../../fixtures/testFixture";
import { RandomUtil } from "../../../utils/RandomUtil";

test.setTimeout(120_000);

test("@smoke Create default new temp", async ({
  page,
  loginPage,
  tempPage,
}) => {
  await loginPage.defaultLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
  });
});

test("@regression Create new temp with custom address", async ({
  page,
  loginPage,
  tempPage,
}) => {
  await loginPage.defaultLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
    address: "345 Taylor Street",
    city: "San Francisco",
    state: "CA",
    zip: "	94102",
  });
});

test("@regression Enable temp flat pay and bill", async ({
  page,
  loginPage,
  tempPage,
}) => {
  await loginPage.defaultLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
  });
  await tempPage.enableFlatPayBill(55, 125);
});

test("@regression Verify enabling Flat Pay disables Auto Pay in Temp Pay section", async ({
  page,
  loginPage,
  tempPage,
}) => {
  await loginPage.defaultLogin();
  await loginPage.navigateToPage("tempManagerClassicView.cfm");
  await tempPage.navigateToCreateTemp();
  await expect(page).toHaveURL("tempview.cfm?newtemp=yes");
  await tempPage.createNewTemp({
    firstname: RandomUtil.generateRandomString(7),
    lastname: RandomUtil.generateRandomString(7),
  });
  await tempPage.enableFlatPayBill(55, 125);
  await tempPage.verifyAutoPayDisplaysDisabled();
  await tempPage.enableAutoPayAndVerifyFlatPayDisabled();
});

test("@regression verify the driving distance between temp and client", async ({
  page,
  loginPage,
  tempPage,
  clearConnectAPI,
  testState,
}) => {
  await loginPage.defaultLogin();
  await clearConnectAPI.insertTempRecords({
    firstName: RandomUtil.generateRandomString(7),
    lastName: RandomUtil.generateRandomString(7),
  });
  await clearConnectAPI.insertClients({
    clientName: RandomUtil.generateRandomString(8),
    address: "765 Medical Center Court",
    city: "Chula Vista",
    state: "CA",
    zip: "91911",
  });
  await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
  await tempPage.clickFacilitiesTab();
  await tempPage.selectRegionInFacilities("All Regions");
  await tempPage.selectClientForFacilities(testState.clientName!);
  await tempPage.clickFacilitiesFilterButton();
  await tempPage.verifyClientFilteredInFacilities(testState.clientName!);
  await tempPage.clickGetDrivingDistance();
  await tempPage.verifyDrivingDistanceAndTime();
  const distance = await tempPage.getDrivingDistanceMiles();
  expect(distance).toBeGreaterThanOrEqual(1300);
  expect(distance).toBeLessThanOrEqual(1450);
});

test("@regression Make temp Oriented with client and verify", async ({
  page,
  loginPage,
  tempPage,
  clearConnectAPI,
  testState,
}) => {
  await loginPage.defaultLogin();
  await clearConnectAPI.insertTempRecords({
    firstName: RandomUtil.generateRandomString(7),
    lastName: RandomUtil.generateRandomString(7),
  });
  expect(testState.tempId).toBeTruthy();
  await clearConnectAPI.insertClients({
    clientName: RandomUtil.generateRandomString(8),
    address: "100 Test Lane",
    city: "Testville",
    state: "TX",
    zip: "75001",
  });
  expect(testState.clientId).toMatch(/^[0-9]+$/);
  await loginPage.navigateToPage(`/wfportal/tempview.cfm?tempid=${testState.tempId}`);
  await expect(page).toHaveURL(new RegExp(`tempview.cfm\\?tempid=${testState.tempId}`));
  await tempPage.clickFacilitiesTab();
  await tempPage.selectRegionInFacilities("All Regions");
  await tempPage.selectClientForFacilities(testState.clientName!);
  await tempPage.clickFacilitiesFilterButton();
  await tempPage.verifyClientFilteredInFacilities(testState.clientName!);
  await tempPage.setClientOriented(testState.clientName!);
  await tempPage.saveFacilities();
  await tempPage.verifyFacilitiesSuccess();
  await tempPage.selectRegionInFacilities("All Regions");
  await tempPage.selectClientForFacilities(testState.clientName!);
  await tempPage.clickFacilitiesFilterButton();
  await tempPage.verifyClientFilteredInFacilities(testState.clientName!);
  const oriented = await tempPage.isClientOriented(testState.clientName!);
  expect(oriented).toBe(true);
});
