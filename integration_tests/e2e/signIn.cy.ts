import { expect, test } from '@playwright/test'

import hmppsAuth from '../mockApis/hmppsAuth'
import frontendComponents from '../mockApis/frontendComponents'

import { login, resetStubs } from '../testUtils'
import DisclaimerPage from '../pages/disclaimer'
import AuthErrorPage from '../pages/authError'

test.describe('SignIn', () => {
  test.beforeEach(async () => {
    await frontendComponents.stubFrontendComponents()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User without hpa role denied access', async ({ page }) => {
    await login(page, { name: 'A TestUser', roles: ['ROLE_OTHER'] })

    await AuthErrorPage.verifyOnPage(page)
  })

  test('User name visible in header', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await expect(disclaimerPage.usersName).toHaveText('J. Smith')
  })

  test('Phase banner visible in header', async ({ page }) => {
    await login(page)

    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)

    await expect(disclaimerPage.phaseBanner).toHaveText('DEV')
  })

  test('User can sign out', async ({ page }) => {
    await login(page)

    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)
    await disclaimerPage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User can manage their details', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    await hmppsAuth.stubManageDetailsPage()

    const disclaimerPage = await DisclaimerPage.verifyOnPage(page)
    await disclaimerPage.clickManageUserDetails()

    await expect(page.getByRole('heading')).toHaveText('Your account details')
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await login(page, { active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })
})
