import { test as base } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { TempPage } from '../pages/TempPage';
import { ClientPage } from '../pages/ClientPage';
import { OrderPage } from '../pages/OrderPage';

type MyFixtures = {

    loginPage: LoginPage;

    tempPage: TempPage;

    clientPage: ClientPage;

    orderPage: OrderPage;
};

export const test = base.extend<MyFixtures>({

    loginPage: async ({ page }, use) => {

        await use(new LoginPage(page));
    },

    tempPage: async ({ page }, use) => {

        await use(new TempPage(page));
    },

    clientPage: async ({ page }, use) => {

        await use(new ClientPage(page));
    },

    orderPage: async ({ page }, use) => {

        await use(new OrderPage(page));
    }
});

export { expect } from '@playwright/test';