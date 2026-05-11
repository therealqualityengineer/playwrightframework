import { test, expect } from '../../../fixtures/testFixture';
import { RandomUtil } from '../../../utils/RandomUtil';
const users = require('../../../test-data/users.json');

test.setTimeout(180_000);

test('@regression Create a new order', async ({ page, loginPage, tempPage, clientPage, orderPage }) =>
{
    await loginPage.login(users.validUser3.username, users.validUser3.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('tempManagerClassicView.cfm');
    await page.locator('a[href="/wfportal/tempview.cfm?newtemp=yes"]').click();
    await expect(page).toHaveURL('tempview.cfm?newtemp=yes');
    await tempPage.createNewTemp
    ({
        firstname : RandomUtil.generateRandomString(7),
        lastname : RandomUtil.generateRandomString(7),
    });
    await loginPage.navigateToPage('clientmanager.cfm');
    await clientPage.createNewClient({
        clientname: RandomUtil.generateRandomString(10),
        quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
    });
    await page.waitForTimeout(10000);
    await loginPage.navigateToPage('ordermanager-legacy.cfm');
    await orderPage.createNewOrder(RandomUtil.getDate(5), "8D (1)", 'RN', 'ER');
});
