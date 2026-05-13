import { test, expect } from '../../../fixtures/testFixture';
import { RandomUtil } from '../../../utils/RandomUtil';

test.setTimeout(120_000);

test('@smoke Create default new temp', async ({ page, loginPage, tempPage }) =>
{
    await loginPage.defaultLogin();
    await loginPage.navigateToPage('tempManagerClassicView.cfm');
    await tempPage.navigateToCreateTemp();
    await expect(page).toHaveURL('tempview.cfm?newtemp=yes');
    await tempPage.createNewTemp
    ({
        firstname : RandomUtil.generateRandomString(7),
        lastname : RandomUtil.generateRandomString(7),
    });
});

test('@regression Create new temp with custom address', async ({ page, loginPage, tempPage }) =>
{
    await loginPage.defaultLogin();
    await loginPage.navigateToPage('tempManagerClassicView.cfm');
    await tempPage.navigateToCreateTemp();
    await expect(page).toHaveURL('tempview.cfm?newtemp=yes');
    await tempPage.createNewTemp
    ({
        firstname : RandomUtil.generateRandomString(7),
        lastname : RandomUtil.generateRandomString(7),
        address : "345 Taylor Street",
        city : "San Francisco",
        state : "CA",
        zip : "	94102"
    });
});

test('@regression Enable temp flat pay and bill', async ({ page, loginPage, tempPage }) =>
{
    await loginPage.defaultLogin();
    await loginPage.navigateToPage('tempManagerClassicView.cfm');
    await tempPage.navigateToCreateTemp();
    await expect(page).toHaveURL('tempview.cfm?newtemp=yes');
    await tempPage.createNewTemp
    ({
        firstname : RandomUtil.generateRandomString(7),
        lastname : RandomUtil.generateRandomString(7),
    });
    await tempPage.enableFlatPayBill(55,125);
});
