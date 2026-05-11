import {test, expect} from '../../fixtures/testFixture';
import { RandomUtil } from '../../utils/RandomUtil';
const users = require('../../test-data/users.json');
import { sharedData } from '../../test-data/sharedData';

test.setTimeout(180_000);

test('@regression Reconcile filled order', async ({ page, loginPage, tempPage, clientPage, clearConnectAPI, timecardPage }) =>
{
    await loginPage.login(users.validUser5.username, users.validUser5.password);
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
    expect(sharedData.clientId).toMatch(/^\d+$/);
        const responseBody = await clearConnectAPI.insertOrder({
            customerID: sharedData.clientId,
            status: 'Filled',
            userId: '1',
            nursetype: 'RN',
            specialty: 'ER',
            jobDateStart: RandomUtil.getDate(0),
            jobDateEnd: RandomUtil.getDate(0),
            shiftStartTime: '07:00',
            shiftEndTime: '15:00',
            shiftType: 'Regular',
            shiftNum: '1',
            filledBy: sharedData.tempId,
            resultType: 'json'
        });
        expect(responseBody[0]?.orderId).toBeTruthy();
        sharedData.orderId = responseBody[0]?.orderId;
        console.log('Created Order ID from API:', sharedData.orderId);
        await timecardPage.reconcileTimecard(sharedData.orderId);
});
