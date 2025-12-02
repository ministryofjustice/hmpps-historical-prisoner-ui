import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstract'

export default class PrintPage extends AbstractPage {
  readonly header: Locator

  readonly saveButton: Locator

  readonly backLink: Locator

  private constructor(name: string, page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: `Which details would you like to save for ${name}?` })
    this.saveButton = page.getByTestId('save-button')
    this.backLink = page.getByRole('link', { name: 'Go back to prisoner details' })
  }

  static async verifyOnPage(name: string, page: Page): Promise<PrintPage> {
    const printPage = new PrintPage(name, page)
    await expect(printPage.header).toBeVisible()
    return printPage
  }

  optionCheckbox(text: string) {
    return this.page.getByText(text)
  }
}
