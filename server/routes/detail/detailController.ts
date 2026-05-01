import { Request, Response } from 'express'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import AuditService, { Page } from '../../services/auditService'
import AbstractDetailController from './abstractDetailController'

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
