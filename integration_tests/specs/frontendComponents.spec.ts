import { expect, test } from '@playwright/test'

import DisclaimerPage from '../pages/disclaimerPage'
import frontendComponents from '../mockApis/frontendComponents'
import { login } from '../testUtils'
import AuthSignInPage from '../pages/authSignInPage'
import hmppsAuth from '../mockApis/hmppsAuth'

test.describe('Frontend Components', () => {
  test.beforeEach('Will sign in', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
  })

  test('User can sign out', async ({ page }) => {
    const landingPage = await DisclaimerPage.verifyOnPage(page)
    await landingPage.signOut()
    await AuthSignInPage.verifyOnPage(page)
  })

  test('User can manage their details', async ({ page }) => {
    await hmppsAuth.stubManageDetailsPage()
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await disclaimerPage.manageUserDetails.click()
    await expect(page).toHaveURL('http://localhost:9091/auth/account-details')
    await expect(page.getByRole('heading', { name: 'Your account details' })).toBeVisible()
  })

  test('User name visible in header', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)
    await expect(disclaimerPage.manageUserDetails).toContainText('J. Smith')
  })

  test('Phase banner visible in header', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)
    await expect(disclaimerPage.phaseBanner).toBeVisible()
  })

  test('should display the correct details for the signed in user', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await expect(disclaimerPage.usersName).toContainText('J. Smith')
    await expect(disclaimerPage.changeLocationLink).toContainText('Moorland')

    await expect(disclaimerPage.manageUserDetails).toHaveAttribute('href', 'http://localhost:9091/auth/account-details')
  })

  test('should show change location link when user has more than 1 caseload', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await expect(disclaimerPage.changeLocationLink).toHaveAttribute('href', 'http://localhost:3002/change-caseload')
  })

  test('should display header even for post request errors', async ({ page }) => {
    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)
    await disclaimerPage.confirmButton.click()

    await expect(disclaimerPage.manageUserDetails).toContainText('J. Smith')
    await expect(disclaimerPage.changeLocationLink).toContainText('Moorland')
    await expect(disclaimerPage.signoutLink).toBeVisible()
  })
})
