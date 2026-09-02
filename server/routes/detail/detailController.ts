import { Request, Response } from 'express'
import { AuditService } from '@ministryofjustice/hmpps-audit-client'

import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import AbstractDetailController from './abstractDetailController'
import Page from '../page'

export default class DetailController extends AbstractDetailController {
  constructor(
    historicalPrisonerService: HistoricalPrisonerService,
    private readonly auditService: AuditService,
  ) {
    super(historicalPrisonerService)
  }

  async getDetail(req: Request, res: Response): Promise<void> {
    const prisonerDetail = await this.getPrisonerDetail(req, res)
    await this.auditService.logPageView(Page.DETAIL, {
      who: res.locals.user.username,
      subjectId: prisonerDetail.prisonNumber,
      correlationId: req.id,
    })
    res.render('pages/detail', { ...prisonerDetail, returnTo: req.query.returnTo })
  }
}
