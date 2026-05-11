import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TimecardPage extends BasePage
{
    private timecardUrl = 'index2.cfm?action=timecard.getTimecardManager';
    private orderIdInput = '#orderid';
    private searchButton = "[name='showtimecard']";

    async reconcileTimecard(orderId : string)
    {
        await this.page.goto(this.timecardUrl);
        await this.TypeText(this.orderIdInput, orderId, 'locator');
        const popupPromise = this.page.waitForEvent('popup', { timeout: 10000 });
        await this.Click(this.searchButton, 'locator');
        const timecardPage = await popupPromise;
        await timecardPage.waitForLoadState('domcontentloaded');
        const timecardPopupPage = new TimecardPage(timecardPage);
        await expect(timecardPopupPage.page).toHaveTitle('Timecards');
        await timecardPopupPage.Click('#updatetimecard', 'locator');
        await expect(timecardPopupPage.page.locator('#cv-userMessage')).toContainText('Timecard saved.');
    }
}