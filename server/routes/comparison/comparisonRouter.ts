import type { Router } from 'express'

import AuditService from '../../services/auditService'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import ComparisonController from './comparisonController'

export default function routes(
  router: Router,
  auditService: AuditService,
  historicalPrisonerService: HistoricalPrisonerService,
): Router {
  const comparisonController = new ComparisonController(historicalPrisonerService, auditService)

  router.get('/comparison', async (req, res, next) => comparisonController.getComparisonDetail(req, res))
  router.post('/comparison/addToShortlist', async (req, res) => comparisonController.addToShortlist(req, res))

  return router
}
