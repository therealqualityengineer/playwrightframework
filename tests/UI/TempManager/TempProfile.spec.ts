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
