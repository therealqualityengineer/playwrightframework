import { test, expect } from '../../fixtures/testFixture';
import { RandomUtil } from '../../utils/RandomUtil';
import { sharedData } from '../../test-data/sharedData';
const users = require('../../test-data/users.json');

test.setTimeout(120_000);

test('@api Verify API method getTemps ', async ({ loginPage, tempPage, page, clearConnectAPI }) =>
{
    await loginPage.login(users.validUser4.username, users.validUser4.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('tempManagerClassicView.cfm');
    await tempPage.navigateToCreateTemp();
    await expect(page).toHaveURL('tempview.cfm?newtemp=yes');
    await tempPage.createNewTemp
    ({
        firstname : RandomUtil.generateRandomString(7),
        lastname : RandomUtil.generateRandomString(7),
    });
    const response = await clearConnectAPI.getTemps(sharedData.tempId);
    const tempId = response[0]?.tempId;
    console.log('Retrieved Temp ID from API:', tempId);
    expect(tempId).toBe(sharedData.tempId);
});

test('@api Verify API method insertOrder', async ({ loginPage, clientPage, clearConnectAPI }) =>
{
    await loginPage.login(users.validUser4.username, users.validUser4.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('clientmanager.cfm');
    await clientPage.createNewClient({
        clientname: RandomUtil.generateRandomString(10),
        quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
    });
    expect(sharedData.clientId).toMatch(/^\d+$/);
    const responseBody = await clearConnectAPI.insertOrder({
        customerID: sharedData.clientId,
        status: 'Open',
        userId: '1',
        nursetype: 'RN',
        specialty: 'ER',
        jobDateStart: RandomUtil.getDate(0),
        jobDateEnd: RandomUtil.getDate(0),
        shiftStartTime: '07:00',
        shiftEndTime: '15:00',
        shiftType: 'Regular',
        shiftNum: '1',
        resultType: 'json'
    });
    console.log('API Response for insertOrder:', responseBody);
    expect(responseBody[0]?.orderId).toBeTruthy();
    sharedData.orderId = responseBody[0]?.orderId;
    console.log('Created Order ID from API:', sharedData.orderId);
});

test('@api Verify API method getOrders', async ({ loginPage, clientPage, clearConnectAPI }) =>
{
    await loginPage.login(users.validUser4.username, users.validUser4.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('clientmanager.cfm');
    await clientPage.createNewClient({
        clientname: RandomUtil.generateRandomString(10),
        quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
    });
    expect(sharedData.clientId).toMatch(/^\d+$/);
    const insertResponse = await clearConnectAPI.insertOrder({
        customerID: sharedData.clientId,
        status: 'Open',
        userId: '1',
        nursetype: 'RN',
        specialty: 'ER',
        jobDateStart: RandomUtil.getDate(0),
        jobDateEnd: RandomUtil.getDate(0),
        shiftStartTime: '07:00',
        shiftEndTime: '15:00',
        shiftType: 'Regular',
        shiftNum: '1',
        resultType: 'json'
    });
    expect(insertResponse[0]?.orderId).toBeTruthy();
    const orderResponse = await clearConnectAPI.getOrders(sharedData.orderId);
    const orderId = orderResponse[0]?.orderId;
    console.log('Retrieved Order ID from API:', orderId);
    expect(orderId).toBe(sharedData.orderId);
});

test('@api Verify API method getClients', async ({ loginPage, clientPage, clearConnectAPI }) =>
{
    await loginPage.login(users.validUser4.username, users.validUser4.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('clientmanager.cfm');
    await clientPage.createNewClient({
        clientname: RandomUtil.generateRandomString(10),
        quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
    });
    expect(sharedData.clientId).toMatch(/^\d+$/);
    const response = await clearConnectAPI.getClients(sharedData.clientId);
    const clientId = response[0]?.clientId;
    console.log('Retrieved Client ID from API:', clientId);
    expect(clientId).toBe(sharedData.clientId);
});
