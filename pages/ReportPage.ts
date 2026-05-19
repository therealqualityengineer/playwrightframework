import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ReportPage extends BasePage {
  private reportUrl = "reports/default.cfm";
  private profitabilityReportUrl = "reports/rw_profitability2.cfm";

  async navigateToReportPage() {
    await this.page.goto(this.reportUrl);
    await this.page.bringToFront();
  }

  async downloadProfitabilityReport(tempName?: string, ReportPeriod?: string) {
    await this.page.goto(this.profitabilityReportUrl);
    if (tempName) {
        await this.Click("#tfobj_textItem0", "locator", { delay: 2000 });
        await this.TypeText("#searchfor", tempName, "locator", { delay: 2000 });
        await this.page.keyboard.press("Space", { delay: 1000 });
        await this.page.locator("#tfobj_selector").locator("li").first().click();
        await this.page.locator('div.CloseBtn').getByText("X").click();
    }
    await this.page.locator('#btnSubmit2').scrollIntoViewIfNeeded();
    await this.Click("[value='excel']", "locator", { delay: 2000 });
    const downloadPromise = this.page.waitForEvent('download');
    await this.Click("#btnSubmit2", "locator", { delay: 2000 });
    const downloadPage = await downloadPromise;
    const fileName = await downloadPage.suggestedFilename();
    await downloadPage.saveAs(`downloads/${fileName}`);
    console.log(fileName);
    await this.verifyFileDownloaded(fileName.split("_")[0] + "_");
  } 

}