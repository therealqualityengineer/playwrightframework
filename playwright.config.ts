import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "qa"}` });

export default defineConfig({
  testDir: "./tests",

  fullyParallel: false,

  workers: 6,

  retries: 1,

  reporter: [["list"], ["html", { open: "never" }], ["allure-playwright"]],
  use: {
    headless: false,

    screenshot: "only-on-failure",

    video: "retain-on-failure",

    trace: "on-first-retry",

    baseURL:
      process.env.BASE_URL ||
      "https://ctmsqa.contingenttalentmanagement.com/wfportal/",
  },

  projects: [
    {
      name: "chromium",

      use: {
        browserName: "chromium",
      },
    },
  ],
});
