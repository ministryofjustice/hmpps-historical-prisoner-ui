import { expect, test } from '@playwright/test'
import frontendComponents from '../mockApis/frontendComponents'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import SearchPage from '../pages/search'
import DisclaimerPage from '../pages/disclaimer'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'
import DetailPage from '../pages/detail'
import ComparisonPage from '../pages/comparison'
import PrintPage from '../pages/print'

test.describe('Detail', () => {
  test.beforeEach('Navigate to search page', async ({ page }) => {
    await frontendComponents.stubFrontendComponents()
    await login(page)
    await DisclaimerPage.confirmDisclaimer(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Will include back link to search results page', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)
    // need to carry out a search to get the results into the session
    await searchPage.firstName.fill('John')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await expect(searchPage.searchResults).toHaveCount(4)

    await historicalPrisonerApi.stubPrisonerDetail()
    await searchPage.detail('Goldie Wilson')
    const detailPage = await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)

    await detailPage.backLink.click()
    const backLinkSearchPage = await SearchPage.verifyOnPage(page)
    // also ensure that search results are still displayed
    await expect(backLinkSearchPage.searchResults).toHaveCount(4)
    await expect(searchPage.firstName).toHaveValue('John')
  })

  test('Will include back link to the comparison page', async ({ page }) => {
    const searchPage = await SearchPage.verifyOnPage(page)

    // need to carry out a search to get the results into the session
    await searchPage.firstName.fill('John')
    await historicalPrisonerApi.stubPrisonerSearchByName()
    await searchPage.searchButton.click()
    await expect(searchPage.searchResults).toHaveCount(4)

    await searchPage.shortlistFormSubmit('BF123455')

    await historicalPrisonerApi.stubPrisonerDetail()
    await searchPage.viewShortlistLink.click()
    const comparisonPage: ComparisonPage = await ComparisonPage.verifyOnPage(page)
    await comparisonPage.detailLink(0).click()

    const detailPage = await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
    await detailPage.backToShortlistLink.click()

    await ComparisonPage.verifyOnPage(page)
    // also ensure that comparison results are still displayed
    await expect(page.getByTestId('name0')).toContainText('Firsta Middlea SURNAMEA')
  })

  test.describe('Will show all sections with data', () => {
    test.beforeEach('Will navigate to detail page', async ({ page }) => {
      await historicalPrisonerApi.stubPrisonerDetail()
      await page.goto('/detail/A1234BC')
    })

    test('Will show prisoner detail', async ({ page }) => {
      await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
    })

    test('Will provide a link to print page', async ({ page }) => {
      const detailPage = await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
      await detailPage.printLink.click()
      await PrintPage.verifyOnPage('Firsta SURNAMEA', page)
    })

    test('Will show prisoner summary', async ({ page }) => {
      await expect(page.getByTestId('dob')).toHaveText('01/01/1980 (45 years)')
      await expect(page.getByTestId('gender')).toHaveText('Male')
      await expect(page.getByTestId('ethnicity')).toHaveText('White - British')
      await expect(page.getByTestId('birthCountry')).toHaveText('England')
      await expect(page.getByTestId('maritalStatus')).toHaveText('Single')
      await expect(page.getByTestId('nationality')).toHaveText('United Kingdom')
      await expect(page.getByTestId('religion')).toHaveText('Church Of England')
      await expect(page.getByTestId('prisonNumber')).toHaveText('AB111111')
      await expect(page.getByTestId('paroleNumbers')).toHaveText('AA12311')
      await expect(page.getByTestId('pncNumber')).toHaveText('012345/99A')
      await expect(page.getByTestId('croNumber')).toHaveText('012345/99C')
    })

    test('Will show prisoner aliases', async ({ page }) => {
      await expect(page.getByTestId('alias0')).toHaveText('Othera A Aliasa')
      await expect(page.getByTestId('aliasDob0')).toHaveText('01/01/1980')
      await expect(page.getByTestId('alias1')).toHaveText('Otherb B Aliasb')
      await expect(page.getByTestId('aliasDob1')).toHaveText('02/01/1980')
    })

    test('Will show prisoner addresses', async ({ page }) => {
      await expect(page.getByTestId('address0Type')).toHaveText('Other')
      await expect(page.getByTestId('address0Person')).toHaveText('First Lasta')
      await expect(page.getByTestId('address0Street')).toHaveText('1, Street Road')
      await expect(page.getByTestId('address0Town')).toHaveText('Town A')
      await expect(page.getByTestId('address0County')).toHaveText('Merseyside')
      await expect(page.getByTestId('address1Type')).toHaveText('Unknown')
      await expect(page.getByTestId('address1Person')).toBeHidden()
      await expect(page.getByTestId('address1Street')).toBeHidden()
      await expect(page.getByTestId('address1Town')).toHaveText('Town B')
      await expect(page.getByTestId('address1County')).toHaveText('Merseyside')
    })

    test('Will show prisoner movements', async ({ page }) => {
      await expect(page.getByTestId('movement0')).toHaveText('OUT - Discharged to court')
      await expect(page.getByTestId('movementDate0')).toHaveText('12/02/1988')
      await expect(page.getByTestId('movementPrison0')).toHaveText('Frankland')
      await expect(page.getByTestId('movement1')).toHaveText('IN - Unconvicted remand')
      await expect(page.getByTestId('movementDate1')).toHaveText('21/12/1987')
      await expect(page.getByTestId('movementPrison1')).toHaveText('Durham')
    })

    test('Will show prisoner court hearings', async ({ page }) => {
      await expect(page.getByTestId('courtHearingDate0')).toHaveText('12/01/2001')
      await expect(page.getByTestId('courtHearing0')).toHaveText('Liskeard County Court')
      await expect(page.getByTestId('courtHearingDate1')).toHaveText('04/01/2001')
      await expect(page.getByTestId('courtHearing1')).toHaveText('Wells County Court')
    })

    test('Will show prisoner HDC recalls', async ({ page }) => {
      await expect(page.getByTestId('recall0RecallDate')).toHaveText('04/01/2001')
      await expect(page.getByTestId('recall0CurfewEndDate')).toHaveText('05/01/2001')
      await expect(page.getByTestId('recall0Outcome')).toHaveText('Re-released following recall')
      await expect(page.getByTestId('recall0OutcomeDate')).toHaveText('02/01/2001')
      await expect(page.getByTestId('recall0Reason')).toHaveText('Change of circs 38a1(b)')
      await expect(page.getByTestId('recall1RecallDate')).toHaveText('01/01/2001')
      await expect(page.getByTestId('recall1CurfewEndDate')).toHaveText('02/01/2001')
      await expect(page.getByTestId('recall1Outcome')).toHaveText('Licence revoked: recalled')
      await expect(page.getByTestId('recall1OutcomeDate')).toHaveText('02/01/2001')
      await expect(page.getByTestId('recall1Reason')).toHaveText('Breach conditions 38a1(a)')
    })

    test('Will show prisoner HDC info', async ({ page }) => {
      await expect(page.getByTestId('info0Stage-key')).toHaveText('HDC eligibility result')
      await expect(page.getByTestId('info0Date')).toHaveText('18/03/2013')
      await expect(page.getByTestId('info0Status')).toHaveText('Eligible')
      await expect(page.getByTestId('info0Reasons')).toHaveText('Created manually')
      await expect(page.getByTestId('info1Stage-key')).toHaveText('HDC eligibility')
      await expect(page.getByTestId('info1Date')).toHaveText('18/03/2013')
      await expect(page.getByTestId('info1Status')).toHaveText('Manual check pass')
      await expect(page.getByTestId('info1Reasons')).toHaveText('Pass all eligibility checks')
    })

    test('Will show prisoner offences', async ({ page }) => {
      await expect(page.getByTestId('offence0')).toHaveText('101')
      await expect(page.getByTestId('offenceDate0')).toHaveText('01/01/2001')
      await expect(page.getByTestId('offencePrison0')).toHaveText('Belmarsh')
      await expect(page.getByTestId('offence1')).toHaveText('48')
      await expect(page.getByTestId('offenceDate1')).toHaveText('02/01/2001')
      await expect(page.getByTestId('offencePrison1')).toHaveText('Durham')
    })

    test('Will show prisoner offences in custody', async ({ page }) => {
      await expect(page.getByTestId('offenceInCustody0Date')).toHaveText('04/01/1991')
      await expect(page.getByTestId('offenceInCustody0Prison')).toHaveText('Full Sutton')
      await expect(page.getByTestId('offenceInCustody0Outcome')).toHaveText('Dismissed')
      await expect(page.getByTestId('offenceInCustody0Charge')).toHaveText('Assault on inmate')
      await expect(page.getByTestId('offenceInCustody0Punishment0Punishment')).toBeHidden()
      await expect(page.getByTestId('offenceInCustody2Date')).toHaveText('02/01/1991')
      await expect(page.getByTestId('offenceInCustody2Prison')).toHaveText('Durham')
      await expect(page.getByTestId('offenceInCustody2Outcome')).toHaveText('Not proven')
      await expect(page.getByTestId('offenceInCustody2Charge')).toHaveText('Offence against GOAD')
      await expect(page.getByTestId('offenceInCustody2Punishment0Punishment')).toHaveText('Extra work')
      await expect(page.getByTestId('offenceInCustody2Punishment0Duration')).toHaveText('(21 days)')
    })

    test('Will show prisoner sentence summary', async ({ page }) => {
      await expect(page.getByTestId('sentenceSummaryCategory')).toContainText('Uncategorised (sent Males)')
      await expect(page.getByTestId('sentenceSummaryCategoryDate')).toHaveText('02/01/2001')
      await expect(page.getByTestId('sentenceSummaryPrison')).toHaveText('Frankland')
      await expect(page.getByTestId('sentenceSummaryCourtHearing')).toHaveText('Liskeard County Court')
      await expect(page.getByTestId('sentenceSummaryCourtHearingDate')).toContainText('12/01/2001')
      await expect(page.getByTestId('sentenceSummaryReceptionDate')).toHaveText('01/01/1999')
    })

    test('Will show prisoner sentencing', async ({ page }) => {
      await expect(page.getByTestId('sentence0ChangeDate')).toHaveText('01/01/2004')
      await expect(page.getByTestId('sentence0SentenceLength')).toHaveText('3027 days')
      await expect(page.getByTestId('sentence0SED')).toHaveText('01/01/2006')
      await expect(page.getByTestId('sentence0LED')).toHaveText('03/03/2005')
      await expect(page.getByTestId('sentence0CRD')).toHaveText('04/04/2004')
      await expect(page.getByTestId('sentence0PED')).toHaveText('04/04/2005')
      await expect(page.getByTestId('sentence0NPD')).toHaveText('04/04/2006')
      await expect(page.getByTestId('sentence0HDCED')).toHaveText('03/03/2004')
      await expect(page.getByTestId('sentence0HDCAD')).toHaveText('01/01/2001')
      await expect(page.getByTestId('sentence1ChangeDate')).toHaveText('01/01/2003')
      await expect(page.getByTestId('sentence1SentenceLength')).toHaveText('2373 days')
      await expect(page.getByTestId('sentence1SED')).toHaveText('02/02/2006')
      await expect(page.getByTestId('sentence1LED')).toHaveText('02/02/2005')
      await expect(page.getByTestId('sentence1CRD')).toHaveText('03/03/2004')
      await expect(page.getByTestId('sentence1PED')).toBeHidden()
      await expect(page.getByTestId('sentence1NPD')).toBeHidden()
      await expect(page.getByTestId('sentence1HDCED')).toBeHidden()
      await expect(page.getByTestId('sentence1HDCAD')).toBeHidden()
    })
  })

  test.describe('Will show all sections with no data', () => {
    test.beforeEach('Will navigate to detail page with no data', async ({ page }) => {
      // @ts-expect-error - stubbing a partial object
      await historicalPrisonerApi.stubPrisonerDetail({ summary: { prisonNumber: 'AB111111', lastName: 'SURNAMEA' } })
      await page.goto('/detail/A1234BC')
    })

    test('Will show prisoner detail', async ({ page }) => {
      await DetailPage.verifyOnPage('SURNAMEA', page)
    })

    test('Will show prisoner summary', async ({ page }) => {
      await expect(page.getByTestId('dob')).toBeHidden()
      await expect(page.getByTestId('gender')).toBeHidden()
      await expect(page.getByTestId('ethnicity')).toBeHidden()
      await expect(page.getByTestId('birthCountry')).toBeHidden()
      await expect(page.getByTestId('maritalStatus')).toBeHidden()
      await expect(page.getByTestId('nationality')).toBeHidden()
      await expect(page.getByTestId('religion')).toBeHidden()
      await expect(page.getByTestId('prisonNumber')).toHaveText('AB111111')
      await expect(page.getByTestId('paroleNumbers')).toBeHidden()
      await expect(page.getByTestId('pncNumber')).toBeHidden()
      await expect(page.getByTestId('croNumber')).toBeHidden()
    })

    test('Will not show prisoner addresses', async ({ page }) => {
      await expect(page.getByTestId('noAddresses')).toBeVisible()
    })

    test('Will not show prisoner aliases', async ({ page }) => {
      await expect(page.getByTestId('noAliases')).toBeVisible()
    })

    test('Will not show court hearings', async ({ page }) => {
      await expect(page.getByTestId('noCourtHearings')).toBeVisible()
    })

    test('Will not show hdc history', async ({ page }) => {
      await expect(page.getByTestId('noHdc')).toBeVisible()
    })

    test('Will not show prisoner movements', async ({ page }) => {
      await expect(page.getByTestId('noMovements')).toBeVisible()
    })

    test('Will not show prisoner offences', async ({ page }) => {
      await expect(page.getByTestId('noOffences')).toBeVisible()
    })

    test('Will not show prisoner offences in custody', async ({ page }) => {
      await expect(page.getByTestId('noOffencesInCustody')).toBeVisible()
    })

    test('Will not show prisoner sentence summary', async ({ page }) => {
      await expect(page.getByTestId('noSentenceSummary')).toBeVisible()
    })

    test('Will not show prisoner sentencing', async ({ page }) => {
      await expect(page.getByTestId('noSentences')).toBeVisible()
    })
  })

  test.describe('Back to top', () => {
    test.beforeEach('Will navigate to detail page', async ({ page }) => {
      await historicalPrisonerApi.stubPrisonerDetail()
      await page.goto('/detail/A1234BC')
    })

    test('Does not display the back to top link initially', async ({ page }) => {
      const detailPage = await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
      await expect(detailPage.backToTopLink).toBeVisible()
      await expect(detailPage.backToTopLink.locator('xpath=..')).toHaveClass(/hmpps-back-to-top--hidden/)
    })

    test('Displays the back to top link after scrolling down', async ({ page }) => {
      const detailPage = await DetailPage.verifyOnPage('Firsta Middlea SURNAMEA', page)
      await detailPage.footer.scrollIntoViewIfNeeded()
      await expect(detailPage.backToTopLink).toBeVisible()
      await expect(detailPage.backToTopLink.locator('xpath=..')).not.toHaveClass(/hmpps-back-to-top--hidden/)
      await detailPage.backToTopLink.click()
    })
  })
})
