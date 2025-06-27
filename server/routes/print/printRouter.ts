import type { Router } from 'express'

import AuditService from '../../services/auditService'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import PrintController from './printController'

export default function routes(
  router: Router,
  auditService: AuditService,
  historicalPrisonerService: HistoricalPrisonerService,
): Router {
  const printController = new PrintController(historicalPrisonerService, auditService)

  router.get('/print/:prisonNo', async (req, res, next) => printController.getPrintForm(req, res))
  router.post('/print/:prisonNo', async (req, res, next) => printController.postPrintForm(req, res))
  router.get('/print/:prisonNo/pdf', async (req, res, next) => printController.renderPdf(req, res))

  return router
}
