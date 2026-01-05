import { expect, test } from '@playwright/test'
import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import SearchPage from '../pages/searchPage'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'
import ComparisonPage from '../pages/comparisonPage'
import DetailPage from '../pages/detailPage'

test.describe('Comparison', () => {
  test.beforeEach('login', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will include back link to search results page', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerDetail()
    const comparisonPage = await ComparisonPage.navigateToShortlist(page)

    await comparisonPage.backLink.click()

    const backLinkSearchPage = await SearchPage.verifyOnPage(page)

    await expect(backLinkSearchPage.searchResults).toHaveCount(4)
    await expect(backLinkSearchPage.firstName).toHaveValue('John')
  })

  test.describe('Will show all sections with data', () => {
    test.beforeEach('navigate to shortlist with data', async ({ page }) => {
      await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123455', lastName: 'SURNAMEA' })
      await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123456', lastName: 'SURNAMEB' })
      await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123457', lastName: 'SURNAMEC' })
      await ComparisonPage.navigateToShortlist(page)
    })
    test('Will show prisoner summary', async ({ page }) => {
      await expect(page.getByTestId('name0')).toHaveText('Firsta Middlea SURNAMEA')
      await expect(page.getByTestId('name1')).toHaveText('Firsta Middlea SURNAMEB')
      await expect(page.getByTestId('name2')).toHaveText('Firsta Middlea SURNAMEC')
      await expect(page.getByTestId('prisonNumber0')).toHaveText('BF123455')
      await expect(page.getByTestId('prisonNumber1')).toHaveText('BF123456')
      await expect(page.getByTestId('prisonNumber2')).toHaveText('BF123457')
      const promises = []
      for (let i = 0; i < 3; i += 1) {
        promises.push(expect(page.getByTestId(`dob${i}`)).toContainText('01/01/1980'))
        promises.push(expect(page.getByTestId(`remove-link${i}`)).toHaveText('Remove from shortlist'))
      }
      await Promise.all(promises)
    })

    test('Will show prisoner background', async ({ page }) => {
      const background = []
      for (let i = 0; i < 3; i += 1) {
        background.push(expect(page.getByTestId(`gender${i}`)).toHaveText('Male'))
        background.push(expect(page.getByTestId(`ethnicity${i}`)).toHaveText('White - British'))
        background.push(expect(page.getByTestId(`birthCountry${i}`)).toHaveText('Born in England'))
        background.push(expect(page.getByTestId(`nationality${i}`)).toHaveText('National of United Kingdom'))
        background.push(expect(page.getByTestId(`religion${i}`)).toHaveText('Church Of England'))
      }
      await Promise.all(background)
    })

    test('Will show prisoner aliases', async ({ page }) => {
      const aliases = []
      for (let i = 0; i < 3; i += 1) {
        aliases.push(expect(page.getByTestId(`prisoner${i}alias0`)).toHaveText('Othera Aliasa, 01/01/1980'))
        aliases.push(expect(page.getByTestId(`prisoner${i}alias1`)).toHaveText('Otherb Aliasb, 02/01/1980'))
      }
      await Promise.all(aliases)
    })

    test('Will show prisoner addresses', async ({ page }) => {
      const addresses = []
      for (let i = 0; i < 3; i += 1) {
        addresses.push(
          expect(page.getByTestId(`prisoner${i}address0`)).toHaveText('Other: 1, Street Road, Town A, Merseyside'),
        )
        addresses.push(expect(page.getByTestId(`prisoner${i}address1`)).toHaveText('Unknown: Town B, Merseyside'))
        addresses.push(
          expect(page.getByTestId(`prisoner${i}address2`)).toHaveText(
            'Next Of Kin: 3, Street Road, Town C, Merseyside',
          ),
        )
      }
      await Promise.all(addresses)
    })
  })

  test.describe('Will show all sections with no data', () => {
    test.beforeEach('navigate to shortlist with no data', async ({ page }) => {
      await historicalPrisonerApi.stubPrisonerDetail({
        // @ts-expect-error - stubbing a partial object
        summary: { prisonNumber: 'AB111111', lastName: 'SURNAMEA' },
      })
      await ComparisonPage.navigateToShortlist(page)
    })

    test('Will show prisoner summary', async ({ page }) => {
      await expect(page.getByTestId('name0')).toContainText('SURNAMEA')
      await expect(page.getByTestId('name1')).toContainText('SURNAMEA')
      await expect(page.getByTestId('name2')).toContainText('SURNAMEA')
      await expect(page.getByTestId('dob0')).not.toBeVisible()
      await expect(page.getByTestId('dob1')).not.toBeVisible()
      await expect(page.getByTestId('dob2')).not.toBeVisible()
      await expect(page.getByTestId('remove-link0')).toHaveText('Remove from shortlist')
      await expect(page.getByTestId('remove-link1')).toHaveText('Remove from shortlist')
      await expect(page.getByTestId('remove-link2')).toHaveText('Remove from shortlist')
    })

    test('Will show prisoner background', async ({ page }) => {
      await expect(page.getByTestId('gender0')).not.toBeVisible()
      await expect(page.getByTestId('gender1')).not.toBeVisible()
      await expect(page.getByTestId('gender2')).not.toBeVisible()
      await expect(page.getByTestId('ethnicity0')).not.toBeVisible()
      await expect(page.getByTestId('ethnicity1')).not.toBeVisible()
      await expect(page.getByTestId('ethnicity2')).not.toBeVisible()
      await expect(page.getByTestId('birthCountry0')).not.toBeVisible()
      await expect(page.getByTestId('birthCountry1')).not.toBeVisible()
      await expect(page.getByTestId('birthCountry2')).not.toBeVisible()
      await expect(page.getByTestId('nationality0')).not.toBeVisible()
      await expect(page.getByTestId('nationality1')).not.toBeVisible()
      await expect(page.getByTestId('nationality2')).not.toBeVisible()
      await expect(page.getByTestId('religion0')).not.toBeVisible()
      await expect(page.getByTestId('religion1')).not.toBeVisible()
      await expect(page.getByTestId('religion2')).not.toBeVisible()
    })

    test('Will show prisoner aliases', async ({ page }) => {
      await expect(page.getByTestId('prisoner0alias0')).toHaveText('No aliases')
      await expect(page.getByTestId('prisoner1alias0')).toHaveText('No aliases')
      await expect(page.getByTestId('prisoner2alias0')).toHaveText('No aliases')
    })

    test('Will show prisoner addresses', async ({ page }) => {
      await expect(page.getByTestId('prisoner0address0')).toHaveText('No addresses')
      await expect(page.getByTestId('prisoner1address0')).toHaveText('No addresses')
      await expect(page.getByTestId('prisoner2address0')).toHaveText('No addresses')
    })
  })

  test('Will provide a link through to the detail page', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerDetail()
    const comparisonPage = await ComparisonPage.navigateToShortlist(page)
    await comparisonPage.detailLink(1).click()
    await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
  })

  test.describe('Will remove prisoners from the short list', () => {
    test.beforeEach('stub shortlist data', async () => {
      await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123455', lastName: 'SURNAMEA' })
      await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123456', lastName: 'SURNAMEB' })
      await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123457', lastName: 'SURNAMEC' })
    })
    test('Will remove an item from the shortlist and stay on the comparison page', async ({ page }) => {
      const comparisonPage = await ComparisonPage.navigateToShortlist(page)

      await expect(comparisonPage.removeFromShortlist(0)).toBeVisible()
      await expect(comparisonPage.removeFromShortlist(1)).toBeVisible()
      await expect(comparisonPage.removeFromShortlist(2)).toBeVisible()
      await comparisonPage.removeFromShortlist(0).click()
      await ComparisonPage.verifyOnPage(page)
      await expect(comparisonPage.removeFromShortlist(0)).toBeVisible()
      await expect(comparisonPage.removeFromShortlist(1)).toBeVisible()
      await expect(comparisonPage.removeFromShortlist(2)).not.toBeVisible()
    })

    test('Will return to the search page if all shortlist prisoners are removed', async ({ page }) => {
      const comparisonPage = await ComparisonPage.navigateToShortlist(page)

      await comparisonPage.removeFromShortlist(2).click()
      await comparisonPage.removeFromShortlist(1).click()
      await comparisonPage.removeFromShortlist(0).click()
      await SearchPage.verifyOnPage(page)
    })
  })

  test('Will return to the search page if attempt to reach comparison page with no prisoners to compare', async ({
    page,
  }) => {
    await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123455', lastName: 'SURNAMEA' })
    await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123456', lastName: 'SURNAMEB' })
    await historicalPrisonerApi.stubComparisonPrisonerDetail({ prisonNumber: 'BF123457', lastName: 'SURNAMEC' })
    const comparisonPage = await ComparisonPage.navigateToShortlist(page)

    await comparisonPage.removeFromShortlist(2).click()
    await comparisonPage.removeFromShortlist(1).click()
    await comparisonPage.removeFromShortlist(0).click()
    await SearchPage.verifyOnPage(page)
    await page.goto('/comparison')
    await SearchPage.verifyOnPage(page)
  })
})
