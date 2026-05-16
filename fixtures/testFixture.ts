import { test as base } from "@playwright/test";

import { LoginPage } from "../pages/LoginPage";
import { TempPage } from "../pages/TempPage";
import { ClientPage } from "../pages/ClientPage";
import { OrderPage } from "../pages/OrderPage";
import { ClearConnectAPI } from "../pages/ClearConnectAPI";
import { TimecardPage } from "../pages/TimecardPage";

export type TestState = {
  tempId?: string;
  temp_firstName?: string;
  temp_lastName?: string;
  clientId?: string;
  clientName?: string;
  orderId?: string;
};

type MyFixtures = {
  loginPage: LoginPage;

  tempPage: TempPage;

  clientPage: ClientPage;

  orderPage: OrderPage;

  clearConnectAPI: ClearConnectAPI;

  timecardPage: TimecardPage;

  testState: TestState;
};

export const test = base.extend<MyFixtures>({
  testState: async ({}, use) => {
    await use({} as TestState);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  tempPage: async ({ page, testState }, use) => {
    await use(new TempPage(page, testState));
  },

  clientPage: async ({ page, testState }, use) => {
    await use(new ClientPage(page, testState));
  },

  orderPage: async ({ page, testState }, use) => {
    await use(new OrderPage(page, testState));
  },

  clearConnectAPI: async ({ request, testState }, use) => {
    await use(new ClearConnectAPI(request, testState));
  },

  timecardPage: async ({ page }, use) => {
    await use(new TimecardPage(page));
  },
});

export { expect } from "@playwright/test";
