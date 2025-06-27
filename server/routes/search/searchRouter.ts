import type { Router } from 'express'

import AuditService from '../../services/auditService'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import SearchController from './searchController'

export default function routes(
  router: Router,
  auditService: AuditService,
  historicalPrisonerService: HistoricalPrisonerService,
): Router {
  const searchController = new SearchController(historicalPrisonerService, auditService)

  router.get('/search', async (req, res, next) => searchController.clearSearch(req, res))
  router.get('/search/results', async (req, res, next) => searchController.getSearch(req, res))
  router.post('/search', async (req, res) => searchController.postSearch(req, res))

  return router
}
