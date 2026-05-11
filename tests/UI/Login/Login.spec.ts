import { test, expect } from '../../../fixtures/testFixture';
const users = require('../../../test-data/users.json');

test('Verify user able to login successfully parallel', async ({ page }) => {

    await page.goto('login.cfm');
    await page.locator('#loginusername').fill(users.validUser1.username);
    await page.locator('#loginpassword').fill(users.validUser1.password);
    await page.locator('#login').click();
    await expect(page).toHaveURL('index2.cfm?action=loginout');    
});