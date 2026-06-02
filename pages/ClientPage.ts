import { ClientData } from "../interfaces/ClientData";
import type { TestState } from "../fixtures/testFixture";
import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class ClientPage extends BasePage {
  constructor(page: import("@playwright/test").Page, private testState: TestState) {
    super(page);
  }

  private newClientLink = 'a[href="/wfportal/clientview.cfm?newclient=yes"]';
  private clientNameTextbox = "[id='clientname']";
  private regionDropdown = "#region";
  private quickBooksIdTextbox = "#quickbooksid";
  private backButton = "input[name='back']";
  private defaultLunchMinutesLabel = "Default Lunch Minutes";
  private payOnlyLabel = "Pay Only";
  private allowEarlyClockInsLabel = "Allow Early Clock-Ins";
  private saveTimeEntryButton = "button:has-text('Save Settings')";

  async clickTimeEntryAndApprovalTab() {
    await this.Click('a:has-text("Time Entry and Approval")', "locator");
    await expect(this.page.locator('text=Default Lunch Minutes')).toBeVisible({
      timeout: 60000,
    });
  }

  async saveTimeEntryApprovalSettings(settings: {
    defaultLunchMinutes: string;
    payOnly: string;
    clientClockingData: string;
    allowEarlyClockIns: string;
  }) {
    const defaultLunchSection = this.page
      .locator(`text=${this.defaultLunchMinutesLabel}`)
      .locator("..");
    await defaultLunchSection
      .locator("input[type='text']")
      .fill(settings.defaultLunchMinutes);

    const payOnlySection = this.page.locator(`text=${this.payOnlyLabel}`).locator("..");
    await payOnlySection.locator(`label:has-text("${settings.payOnly}")`).click();

    const clientClockingSelect = this.page.locator("#ClockingSource");
    await clientClockingSelect.selectOption({ label: settings.clientClockingData });

    const allowEarlyClockInsSection = this.page
      .locator(`text=${this.allowEarlyClockInsLabel}`)
      .locator("..");
    await allowEarlyClockInsSection
      .locator(`label:has-text("${settings.allowEarlyClockIns}")`)
      .click();

    const saveButtonLocator = this.page.locator(this.saveTimeEntryButton);
    await expect(saveButtonLocator).toBeVisible({ timeout: 60000 });
    await saveButtonLocator.scrollIntoViewIfNeeded();
    await saveButtonLocator.click();
  }

  async verifyTimeEntryApprovalSettings(settings: {
    defaultLunchMinutes: string;
    payOnly: string;
    clientClockingData: string;
    allowEarlyClockIns: string;
  }) {
    const defaultLunchSection = this.page
      .locator(`text=${this.defaultLunchMinutesLabel}`)
      .locator("..");
    await expect(defaultLunchSection.locator("input[type='text']")).toHaveValue(
      settings.defaultLunchMinutes,
      { timeout: 60000 },
    );

    const payOnlySection = this.page.locator(`text=${this.payOnlyLabel}`).locator("..");
    await expect(
      payOnlySection.getByRole("radio", { name: settings.payOnly }),
    ).toBeChecked({ timeout: 60000 });

    const clientClockingSelect = this.page.locator("#ClockingSource");
    await expect(
      clientClockingSelect.locator("option:checked"),
    ).toHaveText(settings.clientClockingData, { timeout: 60000 });

    const allowEarlyClockInsSection = this.page
      .locator(`text=${this.allowEarlyClockInsLabel}`)
      .locator("..");
    await expect(
      allowEarlyClockInsSection.getByRole("radio", {
        name: settings.allowEarlyClockIns,
      }),
    ).toBeChecked({ timeout: 60000 });
  }

  async createNewClient(clientData: ClientData) {
    await this.Click(this.newClientLink, "locator");
    await expect(this.page).toHaveURL("clientview.cfm?newclient=yes");
    await this.TypeText(
      this.clientNameTextbox,
      clientData.clientname,
      "locator",
    );
    this.testState.clientName = clientData.clientname ?? "";
    await this.TypeText(
      this.addressTextbox,
      clientData.address ?? "16801 Addison Road",
      "locator",
    );
    await this.TypeText(
      this.cityTextbox,
      clientData.city ?? "Addison",
      "locator",
    );
    await this.TypeText(this.stateTextbox, clientData.state ?? "TX", "locator");
    await this.TypeText(this.zipTextbox, clientData.zip ?? "75001", "locator");
    await this.SelectOption(this.statusDropdown, clientData.status ?? "Active");
    await this.SelectOption(
      this.regionDropdown,
      clientData.region ?? "JasonTest",
    );
    await this.TypeText(
      this.quickBooksIdTextbox,
      clientData.quickbooksid ?? "45645654654646",
      "locator",
    );
    await this.saveClient();
    await expect(this.page.locator(this.backButton)).toBeVisible({
      timeout: 60000,
    });
    const clientId = new URL(this.page.url()).searchParams.get("clientid");
    expect(clientId).toBeTruthy();
    this.testState.clientId = clientId!;
  }

  private async saveClient() {
    const saveButton = this.page.locator(this.saveButton);

    for (let attempt = 1; attempt <= 3; attempt++) {
      await expect(saveButton).toBeVisible({ timeout: 60000 });
      await expect(saveButton).toBeEnabled({ timeout: 60000 });

      try {
        await Promise.all([
          this.page.waitForURL(/clientid=\d+/, {
            timeout: 60000,
            waitUntil: "domcontentloaded",
          }),
          saveButton.click(),
        ]);
        return;
      } catch (error) {
        if (this.page.url().match(/clientid=\d+/)) {
          return;
        }

        if (attempt === 3) {
          throw error;
        }
      }
    }
  }
}
