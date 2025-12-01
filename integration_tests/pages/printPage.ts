import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class PrintPage extends AbstractPage {
  readonly header: Locator

  private constructor(name: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Which details would you like to save for ${name}?` })
  }

  static async verifyOnPage(name: string, page: Page): Promise<PrintPage> {
    const printPage = new PrintPage(name, page)
    await expect(printPage.header).toBeVisible()
    return printPage
  }
  //
  // optionCheckbox = text => cy.contains('label', text).prev()
  //
  // saveButton = (): PageElement => cy.get('button[type="submit"]')
  //
  // backLink = (): PageElement => cy.get('.govuk-back-link')
}
