import { expect, test } from '@playwright/test'

import DisclaimerPage from '../pages/disclaimerPage'
import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import SearchPage from '../pages/searchPage'

test.describe('Disclaimer', () => {
  test.beforeEach(async () => {
    await frontendComponents.stubFrontendComponents()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will show the disclaimer text', async ({ page }) => {
    await login(page)
    await DisclaimerPage.verifyOnPage(page)
  })

  test('Will provide a checkbox that is unchecked', async ({ page }) => {
    await login(page)
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await expect(disclaimerPage.disclaimerCheckbox).not.toBeChecked()
  })

  test('Will return to disclaimer page and show an error if the disclaimer checkbox is not set', async ({ page }) => {
    await login(page)
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await disclaimerPage.confirmButton.click()
    const disclaimerPageUpdate = await DisclaimerPage.verifyOnPage(page)
    await expect(disclaimerPageUpdate.disclaimerCheckbox).not.toBeChecked()
    await expect(disclaimerPageUpdate.errorMessage).toHaveText('You must confirm that you understand the disclaimer')
    await expect(disclaimerPageUpdate.errorSummary).toHaveText('You must confirm that you understand the disclaimer')
  })

  test('Will successfully move to the search screen if disclaimer checkbox selected', async ({ page }) => {
    await login(page)
    await DisclaimerPage.confirmDisclaimer(page)
  })

  test('Will bypass the disclaimer page if the user has already accepted the disclaimer', async ({ page }) => {
    await login(page)
    await page.goto('/disclaimer')
    await DisclaimerPage.confirmDisclaimer(page)

    await page.goto('/disclaimer')
    await SearchPage.verifyOnPage(page)
  })

  test('Will take user to disclaimer page if not accepted disclaimer', async ({ page }) => {
    await login(page)
    await page.goto('/search')

    await DisclaimerPage.verifyOnPage(page)
  })
})
