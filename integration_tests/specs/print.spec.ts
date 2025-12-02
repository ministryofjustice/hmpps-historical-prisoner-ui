import { expect, test } from '@playwright/test'

import frontendComponents from '../mockApis/frontendComponents'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'
import gotenberg from '../mockApis/gotenberg'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import DisclaimerPage from '../pages/disclaimerPage'
import prisonerDetail from '../mockApis/prisonerDetail.json'
import PrintPage from '../pages/printPage'
import DetailPage from '../pages/detailPage'

test.describe('Print', () => {
  test.beforeEach('Navigate to search page', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
    await DisclaimerPage.confirmDisclaimer(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will ensure user has selected a section', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerDetail()

    await page.goto('/print/A1234BC')
    const printPage: PrintPage = await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
    await printPage.saveButton.click()

    const errorPage = await PrintPage.verifyOnPage('Firsta SURNAMEA', page)

    await expect(errorPage.errorSummary).toBeVisible()
    await expect(errorPage.errorSummary).toHaveText('Please select at least one section to print')
  })

  test('Will allow user to select multiple sections', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerDetail({
      ...prisonerDetail,
      summary: { ...prisonerDetail.summary, prisonNumber: 'AB111112' },
    })

    await page.goto('/print/A1234BC')
    const printPage: PrintPage = await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
    await printPage.optionCheckbox('Subject').click()
    await printPage.optionCheckbox('Court').click()

    await gotenberg.stubCreatePdf()
    const downloadPromise = page.waitForEvent('download')
    await printPage.saveButton.click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toEqual('print-AB111112.pdf')

    // Expect to still be on the print page
    await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
  })

  test('Will allow user to select all sections', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerDetail({
      ...prisonerDetail,
      summary: { ...prisonerDetail.summary, prisonNumber: 'AB111113' },
    })

    await page.goto('/print/A1234BC')
    const printPage: PrintPage = await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
    await printPage.optionCheckbox('All, I would like all details').click()

    await gotenberg.stubCreatePdf()
    const downloadPromise = page.waitForEvent('download')
    await printPage.saveButton.click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toEqual('print-AB111113.pdf')

    // Expect to still be on the print page
    await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
  })

  test('Will include back link to detail page', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerDetail()

    await page.goto('/print/A1234BC')
    const printPage: PrintPage = await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
    await printPage.backLink.click()

    await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
  })
})
