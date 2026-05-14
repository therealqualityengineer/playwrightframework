# Manual Test Case to Playwright Test Case

This prompt converts a manual test case description into a Playwright test case, following the Page Object Model and conventions from the AGENTS.md framework documentation.

## Prompt

You are an expert Playwright developer working on a CTMS E2E testing framework.

Convert the following manual test case into a complete Playwright test case in TypeScript.

Use the following guidelines:

- Follow the Page Object Model pattern with page objects extending BasePage.ts
- Use fixtures from testFixture.ts for dependency injection
- Prefer locators in this priority: getByTestId, getByRole, getByLabel, getByText, CSS selectors (XPath only as last resort)
- Use test tags like @smoke, @regression, @api as appropriate
- For API tests, use APIRequestContext
- Include proper assertions using Playwright's built-in assertions
- Handle popups with page.waitForEvent('popup')
- Use shared data from test-data/sharedData.ts if needed for inter-test dependencies
- Keep tests atomic and reusable

Manual Test Case:
${manualTestCase}

Output the complete test code, including imports, test structure, and any necessary setup.
