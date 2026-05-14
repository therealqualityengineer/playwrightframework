import { test, expect } from '../../../fixtures/testFixture';
const users = require('../../../test-data/users.json');
import { mainMenuQuickLinkText } from '../../../test-data/AllverificationData';
import { adminUserLinkText } from '../../../test-data/AllverificationData';

test('@smoke Verify user able to login successfully parallel', async ({ loginPage }) => {

    await loginPage.login(users.validUser1.username, users.validUser1.password);
    await loginPage.verifySuccessfulLogin();
});


test('@smoke Verify Quick link text in main menu page', async ({ loginPage }) => {
    await loginPage.login(users.validUser1.username, users.validUser1.password);
    await loginPage.verifySuccessfulLogin();
    for (const text of Object.values(mainMenuQuickLinkText)) {
        await loginPage.verifyQuickLinkText(text);
    }
});

test('@smoke Verify Quick link text in admin user page', async ({ loginPage }) => {
    await loginPage.login(users.validUser1.username, users.validUser1.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('index2.cfm?action=admin.default');
    for (const text of Object.values(adminUserLinkText)) {
        await loginPage.verifyQuickLinkText(text);
    }
});
