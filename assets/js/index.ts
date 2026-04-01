import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupBackToTop from './backToTop'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', () => {
  const body = document.querySelector('body')
  const pageType = body.getAttribute('data-page')
  switch (pageType) {
    case 'detail':
      setupBackToTop()
      break
  }
})
