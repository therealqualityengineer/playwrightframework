import { test } from '../../../fixtures/testFixture';
import { RandomUtil } from '../../../utils/RandomUtil';
const users = require('../../../test-data/users.json');
import { multipleClientData } from '../../../test-data/MultipleClientData';

test.setTimeout(120_000);

test('Create new client with mandatory fields', async ({ loginPage, clientPage }) => {
    await loginPage.login(users.validUser2.username, users.validUser2.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.navigateToPage('clientmanager.cfm');
    await clientPage.createNewClient({
        clientname: RandomUtil.generateRandomString(7),
        quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
    });
});

multipleClientData.forEach((data) => {
    test(`Create new client with multiple data for ${data.city}, ${data.state}`, async ({ loginPage, clientPage }) => {
        await loginPage.login(users.validUser2.username, users.validUser2.password);
        await loginPage.verifySuccessfulLogin();
        await loginPage.navigateToPage('clientmanager.cfm');
        await clientPage.createNewClient({
            clientname: RandomUtil.generateRandomString(7),
            quickbooksid: RandomUtil.generateRandomAlphaNumeric(10),
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            status: data.status
        });
    });
});
