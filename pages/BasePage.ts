import { Page, expect } from '@playwright/test';

export class BasePage
{

    protected saveButton = "#saveBtn";
    protected addressTextbox ="[id='address']";
    protected cityTextbox = "#city";
    protected stateTextbox = "#state";
    protected zipTextbox = '#zip';
    protected statusDropdown = "[name='status']";

    constructor(protected page : Page){}

    async TypeText(locator: string, text: any, locatorType : 'locator' | 'role' | 'text' | 'testid', options? : any)
    {
        switch(locatorType.toLowerCase())
        {
            case 'locator':
                await this.page.locator(locator).fill(text);
                break;
            case 'role':
                await this.page.getByRole(locator as any, options).fill(text);
                break;
            case 'text':
                await this.page.getByText(locator).fill(text);
                break;
            case 'testid':
                await this.page.getByTestId(locator).fill(text);
                break;
        }
    }

    async SelectOption(locator : string, dropdownOption : string)
    {
        await this.page.locator(locator).selectOption(dropdownOption);
    }

    async Click(locator : string, locatorType : 'locator' | 'role' | 'text' | 'testid', options? : any)
    {
        switch(locatorType.toLowerCase())
        {
            case 'locator':
                await this.page.locator(locator).nth(0).click();
                break;
            case 'role':
                await this.page.getByRole(locator as any, options).click();
                break;
            case 'text':
                await this.page.getByText(locator).click();
                break;
            case 'testid':
                await this.page.getByTestId(locator).click();
                break;
        }
    }

    async ElementVisible(locator : string, locatorType : 'locator' | 'role' | 'text' | 'testid', options? : any)
    {
        switch(locatorType.toLowerCase())
        {
            case 'locator':
                await expect(this.page.locator(locator).nth(0)).toBeVisible(options);
                break;
            case 'role':
                await expect(this.page.getByRole(locator as any, options).nth(0)).toBeVisible(options);
                break;
            case 'text':
                await expect(this.page.getByText(locator).nth(0)).toBeVisible(options);
                break;
            case 'testid':
                await expect(this.page.getByTestId(locator).nth(0)).toBeVisible(options);
                break;
        }
    }

    async TypeTextEnter(locator: string, text: any, locatorType : 'locator' | 'role' | 'text' | 'testid', options? : any)
    {
        switch(locatorType.toLowerCase())
        {
            case 'locator':
                await this.page.locator(locator).fill(text);
                await this.page.keyboard.press('Enter');
                break;
            case 'role':
                await this.page.getByRole(locator as any, options).fill(text);
                await this.page.keyboard.press('Enter');
                break;
            case 'text':
                await this.page.getByText(locator).fill(text);
                await this.page.keyboard.press('Enter');
                break;
            case 'testid':
                await this.page.getByTestId(locator).fill(text);
                await this.page.keyboard.press('Enter');
                break;
        }
    }

}
