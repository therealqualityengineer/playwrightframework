import { defineConfig } from '@playwright/test';

export default defineConfig({

    testDir: './tests',

    fullyParallel: false,

    workers: 4,

    retries: 1,

    reporter: [
        ['list'],
        ['allure-playwright']
    ],

    use: {

        headless: true,

        screenshot: 'only-on-failure',

        video: 'retain-on-failure',

        trace: 'on-first-retry',

        baseURL: 'https://ctmsqa.contingenttalentmanagement.com/wfportal/'
    },

    projects: [
        {
            name: 'chromium',

            use: {
                browserName: 'chromium'
            }
        }
    ]
});
