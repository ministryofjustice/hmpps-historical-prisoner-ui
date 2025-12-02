import { expect, test } from '@playwright/test'

import DisclaimerPage from '../pages/disclaimerPage'
import frontendComponents from '../mockApis/frontendComponents'
import { login } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'

test.describe('Frontend Components Fallback', () => {
  test.beforeEach('Will stub components mapping error', async () => {
    await frontendComponents.stubGetComponentsMappingError()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await page.goto('/')
    await AuthSignInPage.verifyOnPage(page)
  })

  test('User can sign out', async ({ page }) => {
    await login(page)
    const landingPage = await DisclaimerPage.verifyOnPage(page)
    await landingPage.signOut()
    await AuthSignInPage.verifyOnPage(page)
  })

  test.describe('Header', () => {
    test('should not show user name for the signed in user', async ({ page }) => {
      await login(page)
      const landingPage = await DisclaimerPage.verifyOnPage(page)

      // header, location and manage account not displayed in fallback
      await expect(landingPage.usersName).toBeHidden()
      await expect(landingPage.changeLocationLink).toBeHidden()
      await expect(landingPage.manageUserDetails).toBeHidden()
    })

    test('should not show change location link in the fallback', async ({ page }) => {
      await login(page)
      const landingPage = await DisclaimerPage.verifyOnPage(page)

      // headder, location and manage account not displayed in fallback
      await expect(landingPage.changeLocationLink).toBeHidden()
    })
  })
})
