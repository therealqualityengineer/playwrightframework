import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import path from "path";

export class TimecardPage extends BasePage {
  private timecardUrl = "index2.cfm?action=timecard.getTimecardManager";
  private orderIdInput = "#orderid";
  private searchButton = "[name='showtimecard']";
  private viewTimecardImage = "#viewShiftImagesLink";
  private timecardPopupPagetoPass: TimecardPage | null = null;
  private timecardSavedMessage = "#cv-userMessage";
  private selectAllReconcileCheckbox = "#ckbSelectAllDB";
  private postLink = "#postLink";
  private postOkButton = "#button-1009-btnEl";
  private saveTimecardButton = "#updatetimecard";
  private imageCountLocator = "#imageCount";

  async insertTimecardImage(timecardPopupPage: TimecardPage) {
    const filePath = path.resolve(
      process.cwd(),
      "test-data",
      "timecardImage.png",
    );
    const popupPromise = timecardPopupPage.page.waitForEvent("popup");
    await timecardPopupPage.Click(
      timecardPopupPage.viewTimecardImage,
      "locator",
    );
    const imagePopup = await popupPromise;
    await imagePopup.waitForLoadState();
    const fileChooserPromise = imagePopup.waitForEvent("filechooser");
    await imagePopup.locator("#uploadfile").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    // wait for UI reaction after upload
    await expect(imagePopup.locator("#add-btn")).toBeVisible({
      timeout: 15000,
    });
    await imagePopup.close();
    await timecardPopupPage.page.reload();
    await timecardPopupPage.page.bringToFront();
  }

  async reconcileTimecard(
    orderId: string,
    imageOption: "withImage" | "withoutImage" = "withoutImage",
  ) {
    await this.page.goto(this.timecardUrl);
    await this.TypeText(this.orderIdInput, orderId, "locator");
    const popupPromise = this.page.waitForEvent("popup", { timeout: 10000 });
    await this.Click(this.searchButton, "locator");
    const timecardPage = await popupPromise;
    await timecardPage.waitForLoadState("domcontentloaded");
    const timecardPopupPage = new TimecardPage(timecardPage);
    await expect(timecardPopupPage.page).toHaveTitle("Timecards");
    if (imageOption === "withImage") {
      await this.insertTimecardImage(timecardPopupPage);
      await expect(
        timecardPopupPage.page.locator(this.imageCountLocator),
      ).toHaveText("1");
    }
    await timecardPopupPage.Click(this.saveTimecardButton, "locator");
    await expect(
      timecardPopupPage.page.locator(this.timecardSavedMessage),
    ).toContainText("Timecard saved.");
    this.timecardPopupPagetoPass = timecardPopupPage;
  }

  async postTimecard(
    orderId: string,
    timecardPopupPagetoPass: TimecardPage = this.timecardPopupPagetoPass!,
  ) {
    await expect(
      timecardPopupPagetoPass.page.locator(this.timecardSavedMessage),
    ).toContainText("Timecard saved.");
    await timecardPopupPagetoPass.Click(
      this.selectAllReconcileCheckbox,
      "locator",
    );
    await timecardPopupPagetoPass.Click(this.postLink, "locator");
    await timecardPopupPagetoPass.ElementVisible(
      "Timecard Batch(es) posted.",
      "text",
    );
    await timecardPopupPagetoPass.Click(this.postOkButton, "locator");
    await expect(
      timecardPopupPagetoPass.page.getByText("Posted").nth(1),
    ).toBeVisible();
  }
}
