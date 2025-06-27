import type { Router } from 'express'

import SuggestionsController from './suggestionsController'

export default function routes(router: Router): Router {
  const suggestionsController = new SuggestionsController()

  router.get('/suggestions', async (req, res, next) => suggestionsController.getSuggestions(req, res))
  router.get('/suggestion', async (req, res, next) => suggestionsController.applySuggestions(req, res))

  return router
}
