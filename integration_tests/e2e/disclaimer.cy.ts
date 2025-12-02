import { expect, test } from '@playwright/test'

import DisclaimerPage from '../pages/disclaimer'
import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import SearchPage from '../pages/search'

test.describe('Disclaimer', () => {
  test.beforeEach('Will sign in', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will show the disclaimer text', async ({ page }) => {
    await DisclaimerPage.verifyOnPage(page)
  })

  test('Will provide a checkbox that is unchecked', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await expect(disclaimerPage.disclaimerCheckbox).not.toBeChecked()
  })

  test('Will return to disclaimer page and show an error if the disclaimer checkbox is not set', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await disclaimerPage.confirmButton.click()
    const disclaimerPageUpdate = await DisclaimerPage.verifyOnPage(page)
    await expect(disclaimerPageUpdate.disclaimerCheckbox).not.toBeChecked()
    await expect(disclaimerPageUpdate.errorMessage).toHaveText('You must confirm that you understand the disclaimer')
    await expect(disclaimerPageUpdate.errorSummary).toHaveText('You must confirm that you understand the disclaimer')
  })

  test('Will successfully move to the search screen if disclaimer checkbox selected', async ({ page }) => {
    await DisclaimerPage.confirmDisclaimer(page)
  })

  test('Will bypass the disclaimer page if the user has already accepted the disclaimer', async ({ page }) => {
    await page.goto('/disclaimer')
    await DisclaimerPage.confirmDisclaimer(page)

    await page.goto('/disclaimer')
    await SearchPage.verifyOnPage(page)
  })

  test('Will take user to disclaimer page if not accepted disclaimer', async ({ page }) => {
    await page.goto('/search')

    await DisclaimerPage.verifyOnPage(page)
  })
})
