import { ClientData } from "../interfaces/ClientData";
import type { TestState } from "../fixtures/testFixture";
import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class ClientPage extends BasePage {
  constructor(page: import("@playwright/test").Page, private testState: TestState) {
    super(page);
  }

  private newTempLink = 'a[href="/wfportal/clientview.cfm?newclient=yes"]';
  private clientNameTextbox = "[id='clientname']";
  private regionDropdown = "#region";
  private quickBooksIdTextbox = "#quickbooksid";
  private editButton = "input[name='back']";

  async createNewClient(clientData: ClientData) {
    await this.Click(this.newTempLink, "locator");
    await expect(this.page).toHaveURL("clientview.cfm?newclient=yes");
    await this.TypeText(
      this.clientNameTextbox,
      clientData.clientname,
      "locator",
    );
    this.testState.clientName = clientData.clientname ?? "";
    console.log(
      "Client name used for client creation: " + this.testState.clientName,
    );
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
    await expect(this.page.locator(this.editButton)).toBeVisible({
      timeout: 60000,
    });
    const clientId = new URL(this.page.url()).searchParams.get("clientid");
    expect(clientId).toBeTruthy();
    this.testState.clientId = clientId!;
    console.log("Created Client ID: ", clientId);
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
