import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class SearchPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Prisoner search' })
  }

  static async verifyOnPage(page: Page): Promise<SearchPage> {
    const searchPage = new SearchPage(page)
    await expect(searchPage.header).toBeVisible()
    return searchPage
  }
  //
  // searchSelectRadioButton = text => cy.contains('label', text).prev()
  //
  // firstName = (): PageElement => cy.get('#firstName')
  //
  // lastName = (): PageElement => cy.get('#lastName')
  //
  // dobDay = (): PageElement => cy.get('#dobDay')
  //
  // dobMonth = (): PageElement => cy.get('#dobMonth')
  //
  // dobYear = (): PageElement => cy.get('#dobYear')
  //
  // age = (): PageElement => cy.get('#age')
  //
  // prisonNumber = (): PageElement => cy.get('#prisonNumber')
  //
  // pncNumber = (): PageElement => cy.get('#pncNumber')
  //
  // croNumber = (): PageElement => cy.get('#croNumber')
  //
  // address = (): PageElement => cy.get('#address')
  //
  // searchButton = (): PageElement => cy.get('button[type="submit"]')
  //
  // doSearch = (): PageElement => {
  //   return this.searchButton().click()
  // }
  //
  // filter = (filterText: string): PageElement => cy.contains('.moj-filter__tag', filterText)
  //
  // filterButton = (text: string) => cy.contains('label', text).prev()
  //
  // newSearch = (): PageElement => cy.get('[data-qa="clear-search"]')
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
