import { test, expect } from '../../../fixtures/testFixture';
const users = require('../../../test-data/users.json');

test('@smoke Verify user able to login successfully parallel', async ({ loginPage }) => {

    await loginPage.login(users.validUser1.username, users.validUser1.password);
    await loginPage.verifySuccessfulLogin();
});