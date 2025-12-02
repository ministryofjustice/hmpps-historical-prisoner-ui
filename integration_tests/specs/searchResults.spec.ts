import { expect, test } from '@playwright/test'

import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import DisclaimerPage from '../pages/disclaimerPage'
import SearchPage from '../pages/searchPage'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'
import SuggestionsPage from '../pages/suggestionsPage'
import DetailPage from '../pages/detailPage'
import ComparisonPage from '../pages/comparisonPage'

test.describe('Search Results', () => {
  test.beforeEach('Navigate to search page', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
    await DisclaimerPage.confirmDisclaimer(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will populate prisoners matched', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerSearchByName()
    const searchPage = await SearchPage.verifyOnPage(page)
    await searchPage.firstName.fill('John')
    await searchPage.doSearch()
    await expect(searchPage.searchResults).toHaveCount(4)
  })

  test('Will populate prisoners matched with or without alias', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerSearchByName()
    const searchPage = await SearchPage.verifyOnPage(page)
    await searchPage.firstName.fill('John')
    await searchPage.doSearch()
    await expect(searchPage.searchResults).toHaveCount(4)

    await expect(searchPage.searchResults.nth(0).getByTestId('alias')).toBeHidden()
    await expect(searchPage.searchResults.nth(1).getByTestId('alias')).toHaveText('Matched on alias GOLDIE WILSON')
  })

  test('Will provide suggestions link to improve search', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerSearchByName()
    const searchPage = await SearchPage.verifyOnPage(page)
    await searchPage.firstName.fill('John')
    await expect(searchPage.suggestions).toBeHidden()
    await searchPage.doSearch()
    await expect(searchPage.suggestions).toBeVisible()
    await searchPage.suggestions.click()
    await SuggestionsPage.verifyOnPage(page)
  })

  test('Will provide link to prisoner details', async ({ page }) => {
    await historicalPrisonerApi.stubPrisonerSearchByName()
    const searchPage = await SearchPage.verifyOnPage(page)
    await searchPage.firstName.fill('John')
    await searchPage.doSearch()

    const searchPageResults = await SearchPage.verifyOnPage(page)
    await historicalPrisonerApi.stubPrisonerDetail()
    await searchPageResults.detail('Smith Middle WILSON')
    await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
  })

  test.describe('Shortlist', () => {
    test.beforeEach('Navigate to search results page', async ({ page }) => {
      await historicalPrisonerApi.stubPrisonerSearchByName()
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.firstName.fill('John')
      await searchPage.doSearch()
    })

    test('Will show the Add to shortlist item for each row', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await expect(searchPage.addToShortlist('BF123455')).toBeVisible()
      await expect(searchPage.addToShortlist('BF123456')).toBeVisible()
    })
    test('Can add and remove items from the shortlist', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.shortlistFormSubmit('BF123455')

      const searchPageWithRemove = await SearchPage.verifyOnPage(page)
      await expect(searchPageWithRemove.addToShortlist('BF123455')).toBeHidden()
      await expect(searchPageWithRemove.removeFromShortlist('BF123455')).toBeVisible()
      await searchPageWithRemove.removeFromShortlist('BF123455').click()

      const searchPageWithAdd = await SearchPage.verifyOnPage(page)
      await expect(searchPageWithAdd.addToShortlist('BF123455')).toBeVisible()
    })

    test('Will not show shortlist when 3 prisoners added', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.shortlistFormSubmit('BF123455')
      await searchPage.shortlistFormSubmit('BF123456')
      await searchPage.shortlistFormSubmit('BF123457')

      const searchPageFull = await SearchPage.verifyOnPage(page)
      await expect(searchPageFull.addToShortlist('BF123458')).toBeHidden()
      await expect(searchPageFull.removeFromShortlist('BF123455')).toBeVisible()
    })

    test('Will dynamically change view shortlist based on shortlist size', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await expect(searchPage.viewShortlistLink).toBeHidden()

      await searchPage.shortlistFormSubmit('BF123455')
      await expect(searchPage.viewShortlistLink).toHaveText('View shortlist')

      await searchPage.shortlistFormSubmit('BF123456')
      await expect(searchPage.viewShortlistLink).toHaveText('Compare 2 prisoners')

      await searchPage.shortlistFormSubmit('BF123457')
      await expect(searchPage.viewShortlistLink).toHaveText('Compare 3 prisoners')

      await expect(searchPage.addToShortlist('BF123458')).toBeHidden()
    })

    test('Will link to the comparison page', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.shortlistFormSubmit('BF123455')
      await expect(searchPage.viewShortlistLink).toHaveText('View shortlist')

      await historicalPrisonerApi.stubPrisonerDetail()
      await searchPage.viewShortlistLink.click()
      await ComparisonPage.verifyOnPage(page)
    })

    test('Will link to the comparison page when multiple prisoners added', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.shortlistFormSubmit('BF123455')
      await searchPage.shortlistFormSubmit('BF123456')
      await expect(searchPage.viewShortlistLink).toHaveText('Compare 2 prisoners')

      await historicalPrisonerApi.stubPrisonerDetail()
      await searchPage.viewShortlistLink.click()
      await ComparisonPage.verifyOnPage(page)
    })

    test('Performing new search will still remember shortlist', async ({ page }) => {
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.shortlistFormSubmit('BF123455')

      await searchPage.newSearch.click()
      await searchPage.lastName.fill('John')
      await searchPage.doSearch()
      await expect(searchPage.viewShortlistLink).toHaveText('View shortlist')
      await expect(searchPage.removeFromShortlist('BF123455')).toBeVisible()
    })
  })

  test.describe('Paging', () => {
    test.beforeEach('Navigate to search results page', async ({ page }) => {
      await historicalPrisonerApi.stubPrisonerSearchByName()
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.firstName.fill('John')
      await searchPage.doSearch()
    })

    test('Will show the total prisoners returned', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await expect(searchWithResultsPage.searchResults).toHaveCount(4)
      await expect(
        searchWithResultsPage.paginationResults.getByText('Showing 1 to 4 of 6 prisoners').first(),
      ).toBeVisible()
    })

    test('Will show paging information', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await expect(
        searchWithResultsPage.paginationResults.getByText('Showing 1 to 4 of 6 prisoners').first(),
      ).toBeVisible()
      await searchWithResultsPage.paginationResults.getByRole('link', { name: 'Next' }).first().click()
      await SearchPage.verifyOnPage(page)
    })
  })

  test.describe('Filtering', () => {
    test.beforeEach('Navigate to search results page', async ({ page }) => {
      await historicalPrisonerApi.stubPrisonerSearchByName()
      const searchPage = await SearchPage.verifyOnPage(page)
      await searchPage.lastName.fill('Wilson')
      await searchPage.doSearch()
    })

    test('Will show all filters as not selected', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await expect(searchWithResultsPage.filter('Male')).toBeVisible()
      await expect(searchWithResultsPage.filter('Male')).toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('Female')).toBeVisible()
      await expect(searchWithResultsPage.filter('Female')).toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('HDC')).toBeVisible()
      await expect(searchWithResultsPage.filter('HDC')).toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('Lifer')).toBeVisible()
      await expect(searchWithResultsPage.filter('Lifer')).toHaveClass(/unselected/)
    })

    test('Will show the filter selected, if pressed', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await searchWithResultsPage.filter('Male').click()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toBeVisible()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveClass(/selected/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).not.toHaveClass(/unselected/)
    })

    test('Will deselect the filter if reselected', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)

      await searchWithResultsPage.filter('Male').click()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toBeVisible()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveClass(/selected/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).not.toHaveClass(/unselected/)

      await searchWithResultsPage.filter('Remove this filter Male').click()
      await expect(searchWithResultsPage.filter('Male')).toHaveClass(/unselected/)
    })

    test('Will link to page 1 as part of filter when deselected', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await expect(searchWithResultsPage.filter('Male')).toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('Male')).toHaveAttribute('href', '/search/results?page=1&filters=male')
    })

    test('Will link to page 1 as part of filter when selected', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await searchWithResultsPage.filter('Male').click()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).not.toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveAttribute(
        'href',
        '/search/results?page=1',
      )
    })

    test('Will add previously selected filters to other filter links', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await searchWithResultsPage.filter('Male').click()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveAttribute('href', /page=1/)
      await expect(searchWithResultsPage.filter('Female')).toHaveAttribute('href', /filters=female/)
      await expect(searchWithResultsPage.filter('Female')).toHaveAttribute('href', /filters=male/)
    })

    test('Will not include filter in link if previously selected', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await searchWithResultsPage.filter('Male').click()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveClass(/selected/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).not.toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).not.toHaveAttribute('href', /filters=male/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveAttribute('href', /page=1/)
    })

    test('Will show multiple selected filters', async ({ page }) => {
      const searchWithResultsPage = await SearchPage.verifyOnPage(page)
      await searchWithResultsPage.filter('Male').click()
      await searchWithResultsPage.filter('Female').click()
      await expect(searchWithResultsPage.filter('Remove this filter Male')).toHaveClass(/selected/)
      await expect(searchWithResultsPage.filter('Remove this filter Male')).not.toHaveClass(/unselected/)
      await expect(searchWithResultsPage.filter('Remove this filter Female')).toHaveClass(/selected/)
      await expect(searchWithResultsPage.filter('Remove this filter Female')).not.toHaveClass(/unselected/)
    })
  })
})
