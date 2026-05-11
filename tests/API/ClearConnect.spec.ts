import { test, expect } from '../../fixtures/testFixture';
import { RandomUtil } from '../../utils/RandomUtil';
import { sharedData } from '../../test-data/sharedData';
const users = require('../../test-data/users.json');

test.setTimeout(120_000);

test('Verify API method getTemps ', async ({ request, loginPage, tempPage, page }) =>
{
    await loginPage.login(users.validUser4.username, users.validUser4.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('tempManagerClassicView.cfm');
    await page.locator('a[href="/wfportal/tempview.cfm?newtemp=yes"]').click();
    await expect(page).toHaveURL('tempview.cfm?newtemp=yes');
    await tempPage.createNewTemp
    ({
        firstname : RandomUtil.generateRandomString(7),
        lastname : RandomUtil.generateRandomString(7),
    });
    const response = await request.get(
        `https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/?action=getTemps&tempIdIn=${sharedData.tempId}&resultType=json`, 
    {
    headers: { 
        Authorization: `Basic ${Buffer.from('testuser_04:Therealqaengineer@99').toString('base64')}`,
        'Content-Type': 'application/json',
    },
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(responseBody);
    const tempId = responseBody[0]?.tempId;
    console.log('Retrieved Temp ID from API:', tempId);
    expect(tempId).toBe(sharedData.tempId);
});

test('Verify API method insertOrder', async ({ request, loginPage, tempPage, page, clientPage }) =>
{
    await loginPage.login(users.validUser4.username, users.validUser4.password);
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
    const response = await request.post(
        `https://ctmsqa.contingenttalentmanagement.com/wfportal/clearConnect/2_0/`, 
    {
    headers: { 
        Authorization: `Basic ${Buffer.from('testuser_04:Therealqaengineer@99').toString('base64')}`,
    },
    form: {

                action: 'insertOrder',

                customerID: sharedData.clientId,

                status: 'Open',

                userId: '1',

                nursetype: 'RN',

                specialty: 'ER',

                jobDateStart: '2026-12-25',

                jobDateEnd: '2026-12-25',

                shiftStartTime: '07:00',

                shiftEndTime: '15:00',

                shiftType: 'Regular',

                shiftNum: '1',

                resultType: 'json'

            }
    });
    const bodyText = await response.text();
    expect(response.status(), bodyText).toBe(200);
    expect(bodyText, bodyText).not.toContain('Invalid action code');
    const responseBody = JSON.parse(bodyText);
    console.log(responseBody);
    sharedData.orderId = responseBody[0]?.orderId;
});
