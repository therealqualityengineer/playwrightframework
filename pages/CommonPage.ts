import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CommonPage extends BasePage {
  
    constructor(page: Page) 
    {
        super(page);
    }

    deleteAllFilessInDownloadsFolder(downloadPath: string = "downloads") {
        this.deleteFilesInDownloadFolder(downloadPath);
    }

}