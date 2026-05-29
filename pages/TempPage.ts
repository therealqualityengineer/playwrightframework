import type { TestState } from "../fixtures/testFixture";
import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class TempPage extends BasePage {
  constructor(page: import("@playwright/test").Page, private testState: TestState) {
    super(page);
  }

  private temp_firstNameTextbox = "[name='firstname']";
  private temp_lastNameTextBox = "[name='lastname']";
  private homeRegionDropdown = "[id='HomeRegion']";
  private contract_or_ee = "[name='contract_or_ee']";
  private certification = "#certstxt";
  private speciality = "#specstxt";
  private editButton = "input[name='edit'][value='edit']";
  private adjustmentLink = "a[href*='temp.adjustments.view']";
  private payLink = "[href*='/wfportal/temppay.cfm?tempid']";
  private temppayedit = "[name='temppayedit']";
  private flatRadioButton = "[name='howpay'][value='flat']";
  private payflat = "[name='payflat']";
  private billflat = "[name='billflat']";
  private temppayupdate = "[name='temppayupdate']";
  private flatPayBillEnabled = "td:has-text('Flat Pay') ~ td:has-text('Enabled')";
  private autoPayRadioButton = "[name='howpay'][value='auto']";
  private autoPayDisabledText = "td:has-text('Auto Pay') ~ td:has-text('Disabled')";
  private flatPayDisabledText = "td:has-text('Flat Pay') ~ td:has-text('Disabled')";

  private certificationSelect(certification: string) {
    return `[title='${certification}']`;
  }

  private specialitySelect(speciality: string) {
    return `[title='${speciality}']`;
  }

  async createNewTemp(tempData: TempData) {
    await this.TypeText(
      this.temp_firstNameTextbox,
      tempData.firstname,
      "locator",
    );
    this.testState.temp_firstName = tempData.firstname ?? "";
    await this.TypeText(
      this.temp_lastNameTextBox,
      tempData.lastname,
      "locator",
    );
    this.testState.temp_lastName = tempData.lastname ?? "";
    await this.TypeText(
      this.addressTextbox,
      tempData.address ?? "16801 Addison Road",
      "locator",
    );
    await this.TypeText(
      this.cityTextbox,
      tempData.city ?? "Addison",
      "locator",
    );
    await this.TypeText(this.stateTextbox, tempData.state ?? "TX", "locator");
    await this.TypeText(this.zipTextbox, tempData.zip ?? "75001", "locator");
    await this.SelectOption(this.statusDropdown, tempData.status ?? "Active");
    await this.SelectOption(
      this.homeRegionDropdown,
      tempData.homeRegion ?? "JasonTest",
    );
    await this.SelectOption(
      this.contract_or_ee,
      tempData.contract_or_ee ?? "EE",
    );
    await this.TypeText(
      this.certification,
      tempData.certification ?? "RN",
      "locator",
    );
    await this.Click(
      this.certificationSelect(tempData.certification ?? "RN"),
      "locator",
    );
    await this.TypeText(
      this.speciality,
      tempData.speciality ?? "ER",
      "locator",
    );
    await this.Click(
      this.specialitySelect(tempData.speciality ?? "ER"),
      "locator",
    );
    await this.Click(this.saveButton, "locator");
    await this.ElementVisible(this.editButton, "locator");
    await this.ElementVisible("Credentials", "text");
    await this.Click(this.adjustmentLink, "locator");
    await expect(this.page.locator("#workerHeaderNav")).toBeVisible({ timeout: 30000 });
    const tempIdLocator = await this.page
      .locator("#workerHeaderNav")
      .locator("small")
      .nth(0)
      .textContent();
    const tempId = tempIdLocator?.split(" ")[1] ?? "";
    this.testState.tempId = tempId;
  }

  async enableFlatPayBill(flatPay: number, flatBill: number) {
    await this.Click(this.payLink, "locator");
    await this.Click(this.temppayedit, "locator");
    await this.Click(this.flatRadioButton, "locator");
    await this.TypeText(this.payflat, flatPay.toString(), "locator");
    await this.TypeText(this.billflat, flatBill.toString(), "locator");
    await this.Click(this.temppayupdate, "locator");
    const flatPayEnabled = this.page.locator(this.flatPayBillEnabled);
    await expect(flatPayEnabled).toBeVisible({ timeout: 10000 });
  }

  async verifyAutoPayDisplaysDisabled() {
    await expect(this.page.locator(this.autoPayDisabledText)).toBeVisible({ timeout: 10000 });
  }

  async enableAutoPayAndVerifyFlatPayDisabled() {
    await this.Click(this.temppayedit, "locator");
    await this.Click(this.autoPayRadioButton, "locator");
    await this.Click(this.temppayupdate, "locator");
    await expect(this.page.locator(this.flatPayDisabledText)).toBeVisible({ timeout: 10000 });
  }

  async navigateToCreateTemp() {
    await this.Click('a[href="/wfportal/tempview.cfm?newtemp=yes"]', "locator");
  }

  async updateTemp(tempUpdateData: TempUpdateData) {
    await this.page.goto(`/wfportal/tempview.cfm?tempid=${this.testState.tempId}`);
    await this.Click(this.editButton, "locator");
    if(tempUpdateData.EligibleForDailyPay === "Yes") {
      await this.Click("[name='eligibleForDailyPay'][value='1']", "locator");
    }else if(tempUpdateData.EligibleForDailyPay === "No") {
      await this.Click("[name='eligibleForDailyPay'][value='0']", "locator");
    }
    if(tempUpdateData.DailyPayAdvancePercentage) {
      await this.TypeText("[name='dailyPayAdvancePercentage']", tempUpdateData.DailyPayAdvancePercentage, "locator");
    }
    await this.Click(this.saveButton, "locator");
    await this.ElementVisible(this.editButton, "locator");
  }
}
