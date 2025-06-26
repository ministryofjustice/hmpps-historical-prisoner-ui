import Page from '../pages/page'
import DisclaimerPage from '../pages/disclaimer'
import SearchPage from '../pages/search'

context('Sign In', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubFrontendComponents')
    cy.task('stubSignIn', { roles: ['ROLE_HPA_USER'] })
    cy.signIn()
  })

  it('Will show the disclaimer text', () => {
    Page.verifyOnPage(DisclaimerPage)
    cy.title().should('eq', 'Usage - FORCE TEST ERROR')
  })

  it('Will provide a checkbox that is unchecked', () => {
    const disclaimerPage = Page.verifyOnPage(DisclaimerPage)
    disclaimerPage.disclaimerCheckbox.should('not.be.checked')
  })

  it('Will return to disclaimer page and show an error if the disclaimer checkbox is not set', () => {
    const disclaimerPage = Page.verifyOnPage(DisclaimerPage)
    disclaimerPage.confirmButton().click()
    const disclaimerPageUpdate = Page.verifyOnPage(DisclaimerPage)
    disclaimerPageUpdate
      .errorSummaryList()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('You must confirm that you understand the disclaimer')
      })
    cy.title().should('eq', 'Error: Usage')
  })

  it('Will successfully move to the search screen if disclaimer checkbox selected', () => {
    const disclaimerPage = Page.verifyOnPage(DisclaimerPage)
    disclaimerPage.confirmDisclaimer()
    Page.verifyOnPage(SearchPage)
  })

  it('Will bypass the disclaimer page if the user has already accepted the disclaimer', () => {
    cy.visit('/disclaimer')
    const disclaimerPage = Page.verifyOnPage(DisclaimerPage)
    disclaimerPage.confirmDisclaimer()

    Page.verifyOnPage(SearchPage)

    cy.visit('/disclaimer')
    Page.verifyOnPage(SearchPage)
  })

  it('Will take user to disclaimer page if not accepted disclaimer', () => {
    Page.verifyOnPage(DisclaimerPage)

    cy.visit('/search')
    Page.verifyOnPage(DisclaimerPage)
  })
})
