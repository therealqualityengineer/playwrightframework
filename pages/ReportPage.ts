import { BasePage } from "./BasePage";
import { expect, TestState } from "../fixtures/testFixture";
import * as XLSX from "xlsx";

export class ReportPage extends BasePage {

  constructor(page: import("@playwright/test").Page, private testState: TestState) {
    super(page);

  }

  private reportUrl = "reports/default.cfm";
  private profitabilityReportUrl = "reports/rw_profitability2.cfm";
  private tempProfilesReportUrl = "reports/rw_tempprofiles.cfm";
  private clientProfilesReportUrl = "reports/rw_clientprofile.cfm";

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
    this.testState.fileName = fileName;
    await this.verifyFileDownloaded(fileName.split("_")[0] + "_");
  }

  async downloadTempProfilesReport(tempName?: string) {
    await this.page.goto(this.tempProfilesReportUrl);
    if (tempName) {
        await this.Click("#tfobj_textItem0", "locator", { delay: 2000 });
        await this.TypeText("#searchfor", tempName, "locator", { delay: 2000 });
        await this.page.keyboard.press("Space", { delay: 1000 });
        await this.page.locator("#tfobj_selector").locator("li").first().click();
        await this.page.locator('div.CloseBtn').getByText("X").click();
    }
    await this.page.getByRole('cell', { name: 'All', exact: true }).getByRole('checkbox').check();
    await this.page.getByRole('cell', { name: 'Excel Format (.xls)' }).getByRole('checkbox').check();
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: 'Run Report' }).last().click();
    const downloadPage = await downloadPromise;
    const fileName = await downloadPage.suggestedFilename();
    await downloadPage.saveAs(`downloads/${fileName}`);
    this.testState.fileName = fileName;
    await this.verifyFileDownloaded("tempprofiles");
  }

  async downloadClientProfilesReport(clientName?: string) {
    await this.page.goto(this.clientProfilesReportUrl);
    if (clientName) {
        await this.page.locator('img[alt="Search for Clients"]').click();
        await this.page.getByRole('textbox', { name: 'Search for' }).fill(clientName);
        await this.page.getByRole('button', { name: 'Search' }).click();
        await this.page.getByText(clientName).first().click();
        await this.page.getByRole('button', { name: 'Close' }).click();
    }
    const popupPromise = this.page.waitForEvent("popup", { timeout: 10000 });
    await this.page.getByRole('button', { name: 'Run Report' }).first().click();
    const reportPopup = await popupPromise;
    await reportPopup.waitForLoadState("domcontentloaded");
    if (clientName) {
        await expect(reportPopup.getByText(clientName).first()).toBeVisible();
    }
    const downloadPromise = reportPopup.waitForEvent('download');
    await reportPopup.getByText('Export to Excel').click();
    const downloadEvent = await downloadPromise;
    const fileName = await downloadEvent.suggestedFilename();
    await downloadEvent.saveAs(`downloads/${fileName}`);
    this.testState.fileName = fileName;
    await this.verifyFileDownloaded(fileName.split("_")[0] + "_");
  }

  async verifyDataInExcel(fileName: string, expectedData: string) {
    const workbook =XLSX.readFile(`downloads/${fileName}`);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data =XLSX.utils.sheet_to_json(worksheet);
    expect(JSON.stringify(data)).toContain(expectedData);
  }

}