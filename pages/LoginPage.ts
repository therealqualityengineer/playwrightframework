import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import users from '../test-data/users.json'

export class LoginPage extends BasePage
{
    async navigateToLoginPage()
    {
        await this.page.goto('login.cfm');
    }

    async enterUserName(username : string)
    {
        await this.TypeText("#loginusername",username, 'locator');
    }

    async enterPassword(password : string)
    {
        await this.TypeText("#loginpassword",password, 'locator');
    }

    async submitButton()
    {
        await this.Click('button', 'role', {name : 'login'});
    }

    async verifySuccessfulLogin()
    {
        await expect(this.page).toHaveURL('https://ctmsqa.contingenttalentmanagement.com/wfportal/index2.cfm?action=loginout', {timeout: 10000});
    }

    async login(username: string, password : string)
    {
        await this.navigateToLoginPage();
        await this.enterUserName(username);
        await this.enterPassword(password);
        await this.submitButton();
    }

    async navigateToPage(partialUrl : string)
    {
        await this.page.goto(partialUrl);
    }

    async defaultLogin()
    {
        await this.navigateToLoginPage();
        await this.enterUserName(users.defaultUser.username);
        await this.enterPassword(users.defaultUser.password);
        await this.submitButton();
    }

    async verifyQuickLinkText(expectedQuickLinkText : any)
    {
        await expect(this.page.getByText(expectedQuickLinkText).nth(0)).toBeVisible({ timeout: 10000 });
    }

}