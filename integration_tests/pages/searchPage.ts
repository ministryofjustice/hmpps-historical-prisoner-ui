import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class SearchPage extends AbstractPage {
  readonly header: Locator

  readonly firstName: Locator

  readonly lastName: Locator

  readonly dobDay: Locator

  readonly dobMonth: Locator

  readonly dobYear: Locator

  readonly age: Locator

  readonly prisonNumber: Locator

  readonly pncNumber: Locator

  readonly croNumber: Locator

  readonly address: Locator

  readonly searchButton: Locator

  readonly newSearch: Locator

  readonly nameAgeRadioButton: Locator

  readonly identifierRadioButton: Locator

  readonly otherRadioButton: Locator

  readonly suggestions: Locator

  readonly viewShortlistLink: Locator

  readonly searchResults: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Prisoner search' })
    this.firstName = page.getByRole('textbox', { name: 'First name or initial' })
    this.lastName = page.getByRole('textbox', { name: 'Last name' })
    this.dobDay = page.getByRole('textbox', { name: 'Day' })
    this.dobMonth = page.getByRole('textbox', { name: 'Month' })
    this.dobYear = page.getByRole('textbox', { name: 'Year' })
    this.age = page.getByRole('textbox', { name: 'Or, enter an age or age range' })
    this.prisonNumber = page.getByRole('textbox', { name: 'Prison number' })
    this.pncNumber = page.getByRole('textbox', { name: 'PNC number' })
    this.croNumber = page.getByRole('textbox', { name: 'CRO number' })
    this.address = page.getByRole('textbox', { name: 'Enter any combination of' })
    this.searchButton = page.getByRole('button', { name: 'Search' })
    this.newSearch = page.getByTestId('clear-search')
    this.nameAgeRadioButton = page.getByRole('radio', { name: 'Name/age' })
    this.identifierRadioButton = page.getByRole('radio', { name: 'Unique identifier' })
    this.otherRadioButton = page.getByRole('radio', { name: 'Other' })
    this.suggestions = page.getByTestId('suggestions')
    this.viewShortlistLink = page.getByTestId('view-shortlist')
    this.searchResults = page.getByTestId('search-results').locator('tbody tr')
  }

  static async verifyOnPage(page: Page): Promise<SearchPage> {
    const searchPage = new SearchPage(page)
    await expect(searchPage.header).toBeVisible()
    return searchPage
  }

  async doSearch() {
    await this.searchButton.click()
  }

  async shortlistFormSubmit(prisonNumber: string) {
    return this.page.getByTestId(`shortlist-${prisonNumber}`).getByRole('button', { name: 'Add to shortlist' }).click()
  }

  async detail(name: string) {
    return this.page.getByRole('link', { name }).click()
  }

  //
  // filter = (filterText: string): PageElement => cy.contains('.moj-filter__tag', filterText)
  //
  // filterButton = (text: string) => cy.contains('label', text).prev()
  //
  // suggestions = (): PageElement => cy.get('[data-qa="suggestions"]')
  //
  // searchResults = (): PageElement => cy.get('[data-qa="search-results"] tbody tr ')
  //
  // searchResultsCount = (): PageElement => cy.get('[data-qa="search-results-count"] ')
  //
  // getPaginationResults = (): PageElement => cy.get('.moj-pagination__results')
  //
  // nextPage = (): PageElement => cy.get('.moj-pagination__item--next').first().click()
  //
  // detailLink = (prisonNumber: string): PageElement => cy.get(`a[href="/detail/${prisonNumber}"]`)
  //
  // shortlistFormSubmit = (prisonNumber: string): PageElement =>
  //   cy.get(`form[data-qa="shortlist-${prisonNumber}"] input[type="submit"]`)
  //
  // viewShortlistLink = (): PageElement => cy.get('[data-qa="view-shortlist"]')
}
