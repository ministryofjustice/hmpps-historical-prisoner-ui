import { Router } from 'express'

import type { Services } from '../services'
import disclaimerRoutes from './disclaimer/disclaimerRouter'
import searchRoutes from './search/searchRouter'
import printRoutes from './print/printRouter'
import detailRoutes from './detail/detailRouter'
import comparisonRoutes from './comparison/comparisonRouter'
import suggestionsRoutes from './suggestions/suggestionsRouter'

export default function routes({ auditService, historicalPrisonerService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    return res.redirect('/search')
  })

  disclaimerRoutes(router)
  searchRoutes(router, auditService, historicalPrisonerService)
  detailRoutes(router, auditService, historicalPrisonerService)
  suggestionsRoutes(router)
  comparisonRoutes(router, auditService, historicalPrisonerService)
  printRoutes(router, auditService, historicalPrisonerService)

  return router
}
