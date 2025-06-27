import type { Router } from 'express'

import AuditService from '../../services/auditService'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import DetailController from './detailController'

export default function routes(
  router: Router,
  auditService: AuditService,
  historicalPrisonerService: HistoricalPrisonerService,
): Router {
  const detailController = new DetailController(historicalPrisonerService, auditService)

  router.get('/detail/:prisonNo', async (req, res, next) => detailController.getDetail(req, res))

  return router
}
