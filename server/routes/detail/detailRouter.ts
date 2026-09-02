import type { Router } from 'express'
import { AuditService } from '@ministryofjustice/hmpps-audit-client'

import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import DetailController from './detailController'

export default function routes(
  router: Router,
  auditService: AuditService,
  historicalPrisonerService: HistoricalPrisonerService,
): Router {
  const detailController = new DetailController(historicalPrisonerService, auditService)

  router.get('/detail/:prisonNo', async (req, res) => detailController.getDetail(req, res))

  return router
}
