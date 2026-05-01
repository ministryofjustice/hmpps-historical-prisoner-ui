import { Request, Response } from 'express'
import getSearchSuggestions from '../../utils/suggestionHelpers'

export default class SuggestionsController {
  constructor() {}

  getSuggestions(req: Request, res: Response) {
    if (!req.session.prisonerSearchForm) req.session.prisonerSearchForm = { searchType: 'name' }
    return res.render('pages/suggestion', { suggestions: getSearchSuggestions(req.session.prisonerSearchForm) })
  }

  applySuggestions(req: Request, res: Response) {
    if (!req.session.prisonerSearchForm) req.session.prisonerSearchForm = { searchType: 'name' }
    if (req.query.firstName !== undefined) {
      req.session.prisonerSearchForm.firstName = req.query.firstName as string
    }
    if (req.query.lastName !== undefined) {
      req.session.prisonerSearchForm.lastName = req.query.lastName as string
    }
    if (req.query.age !== undefined) {
      req.session.prisonerSearchForm.age = req.query.age as string
      req.session.prisonerSearchForm.dobDay = undefined
      req.session.prisonerSearchForm.dobMonth = undefined
      req.session.prisonerSearchForm.dobYear = undefined
    }
    return res.redirect('/search/results')
  }
}
