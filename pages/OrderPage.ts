import { BasePage } from "./BasePage";
import { sharedData } from "../test-data/sharedData";
import { expect } from "../fixtures/testFixture";

export class OrderPage extends BasePage {
  private newOrderLink = "a[href*='orderdetail_new.cfm']";
  private clientNameTextbox = "#clientname";
  private tempNameTextbox = "#tempSelector";
  private jobDateTextbox = "#jobdatestart_display";
  private shiftDropdown = "#shiftid";
  private certtextbox = "#certstxt";
  private specialitytextbox = "#specstxt";
  private saveDoneButton = "#createdone";
  private TempConfirmCheck = "[name='TempConfirmYN']";
  private ClientConfirmCheck = "[name='ClientConfirmYN']";
  private FillOutOrderButton = "#confirmed1";
  private orderNumberLocator = "[onclick*='orderdetail_new.cfm?edit=']";

  private certificationSelect(certification: string) {
    return `[title='${certification}']`;
  }

  private specialitySelect(speciality: string) {
    return `[title='${speciality}']`;
  }

  async createNewOrder(
    jobDate: string,
    shift: string,
    certs: string,
    speciality: string,
  ) {
    const popupPromise = this.page.waitForEvent("popup", { timeout: 10000 });
    await this.Click(this.newOrderLink, "locator");
    const orderPage = await popupPromise;
    await orderPage.waitForLoadState("domcontentloaded");
    await expect(orderPage.locator(this.clientNameTextbox)).toBeVisible({
      timeout: 15000,
    });
    const orderPopupPage = new OrderPage(orderPage);
    console.log(
      "Client name used for order creation: " + sharedData.clientName,
    );
    await orderPopupPage.selectLookupValue(
      orderPopupPage.clientNameTextbox,
      sharedData.clientName,
      `[href*='clientview.cfm?newwindow=yes&clientid=${sharedData.clientId}']`,
      0,
    );
    await orderPopupPage.selectLookupValue(
      orderPopupPage.tempNameTextbox,
      sharedData.temp_firstName,
      `[href*='tempview.cfm?newwindow=yes&tempid=${sharedData.tempId}']`,
      1,
    );
    await orderPopupPage.TypeText(
      orderPopupPage.jobDateTextbox,
      jobDate,
      "locator",
    );
    await orderPopupPage.SelectOption(orderPopupPage.shiftDropdown, shift);
    await orderPopupPage.TypeText(orderPopupPage.certtextbox, certs, "locator");
    await orderPopupPage.Click(
      orderPopupPage.certificationSelect(certs),
      "locator",
    );
    await orderPopupPage.TypeText(
      orderPopupPage.specialitytextbox,
      speciality,
      "locator",
    );
    await orderPopupPage.Click(
      orderPopupPage.specialitySelect(speciality),
      "locator",
    );
    await orderPopupPage.Click(orderPopupPage.saveDoneButton, "locator");
    await orderPopupPage.Click(orderPopupPage.TempConfirmCheck, "locator");
    await orderPopupPage.Click(orderPopupPage.ClientConfirmCheck, "locator");
    await orderPopupPage.Click(orderPopupPage.FillOutOrderButton, "locator");
    const orderNumber = await this.page
      .locator(this.orderNumberLocator)
      .nth(0)
      .innerText();
    sharedData.orderId = orderNumber;
    console.log("Created order number: " + orderNumber);
  }

  private async selectLookupValue(
    inputLocator: string,
    searchText: string,
    resultLocator: string,
    searchButtonIndex: number,
  ) {
    const input = this.page.locator(inputLocator);
    const result = this.page.locator(resultLocator).first();
    const searchButton = this.page
      .getByRole("button", { name: "Search" })
      .nth(searchButtonIndex);

    for (let attempt = 1; attempt <= 6; attempt++) {
      await input.fill("");
      await input.pressSequentially(searchText, { delay: 50 });
      await searchButton.click();

      try {
        await expect(result).toBeVisible({ timeout: 10000 });
        await result.click();
        return;
      } catch (error) {
        if (attempt === 6) {
          throw error;
        }

        await this.page.waitForTimeout(5000);
      }
    }
  }
}
