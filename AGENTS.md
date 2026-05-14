# Playwright Framework - Agent Instructions

## Project Overview

This is an enterprise E2E test automation framework for a Contingent Talent Management System (CTMS) using Playwright Test in TypeScript. It follows a Page Object Model (POM) pattern with support for UI and API testing across QA, UAT, and Stage environments.

## Key Commands

- `npm run test` - Run all tests (4 parallel workers)
- `npm run test:qa/uat/stage` - Run tests in specific environment (sets NODE_ENV)
- `npm run smoke` - Run @smoke tagged tests
- `npm run regression` - Run @regression tagged tests
- `npm run api` - Run @api tagged tests
- `npm run allure` - Serve Allure reports
- `npm run allure:clear` - Clear Allure artifacts

## Architecture

- **Fixtures** (`fixtures/testFixture.ts`): Custom typed fixtures extending Playwright's base test, providing page objects and API contexts
- **Pages** (`pages/`): Page Object Model classes extending BasePage.ts with common utilities
- **Interfaces** (`interfaces/`): Type contracts for test data (e.g., ClientData.ts)
- **Utils** (`utils/`): Helper functions like random data generation
- **Test Data** (`test-data/`): Static data files and shared mutable state object
- **Tests** (`tests/`): Organized by API/UI features with tag-based execution

## Conventions

- Use test tags: `@smoke` for critical paths, `@regression` for comprehensive coverage, `@api` for API tests
- Page objects extend BasePage.ts with locator abstraction supporting CSS, role, text, and testid selectors
- Shared state via `test-data/sharedData.ts` for inter-test dependencies (use cautiously to avoid coupling)
- Data-driven tests using forEach on test data arrays
- Popup handling with `page.waitForEvent('popup')` and page object reuse
- Environment configuration via `.env.{NODE_ENV}` files loaded in playwright.config.ts

## Potential Pitfalls

- Shared mutable state in sharedData.ts can cause test coupling and flakiness
- Ensure proper cleanup in fixture `use` callbacks
- Base URL defaults to QA environment; override with NODE_ENV
- Popup timeouts default to 10s; adjust for slow environments
- Fully parallel disabled; tests may have dependencies

## Key Files

- [BasePage.ts](pages/BasePage.ts) - Common page utilities and locator abstraction
- [testFixture.ts](fixtures/testFixture.ts) - Custom fixtures for dependency injection
- [playwright.config.ts](playwright.config.ts) - Test configuration and environment setup
- [package.json](package.json) - Scripts and dependencies</content>
  <parameter name="filePath">/Users/arunramalingam/Documents/GitHub/PlaywrightFramework/PlaywrightFramework/AGENTS.md

## Coding Standards

- Prefer Playwright built-in assertions over manual validations
- Avoid hardcoded waits (`waitForTimeout`) unless unavoidable
- Use reusable methods in BasePage instead of direct page actions
- Prefer stable locators (`data-testid`, role, accessible locators)
- Keep page methods atomic and reusable
- Avoid duplicate locators across page objects
- Use explicit typing in TypeScript
- Keep assertions inside tests unless validation is reusable

## API Testing Standards

- Use APIRequestContext for API calls
- Reuse authorization header methods
- Prefer reusable API helper/service classes
- Validate response status, schema, and important fields
- Avoid hardcoded test data where possible
- Log response body for easier debugging

## Locator Strategy Priority

1. getByTestId
2. getByRole
3. getByLabel
4. getByText
5. CSS selectors
6. XPath only as last resort

## CI/CD

- GitHub Actions used for scheduled and manual executions
- Separate workflows for smoke, regression, and API suites
- Allure reports published to GitHub Pages
- Test retries enabled for flaky environments

## Avoid

- Do not introduce hardcoded credentials
- Do not add unnecessary waits
- Do not duplicate utility methods already present in BasePage
- Do not generate XPath locators unless unavoidable
- Do not modify framework architecture without explicit request
