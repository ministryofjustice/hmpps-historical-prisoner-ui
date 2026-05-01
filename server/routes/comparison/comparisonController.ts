import { Request, Response } from 'express'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import AuditService, { Page } from '../../services/auditService'
import { PrisonerDetailDto } from '../../@types/historical-prisoner/historicalPrisonerApiTypes'
import logger from '../../../logger'

export default class ComparisonController {
  constructor(
    private readonly historicalPrisonerService: HistoricalPrisonerService,
    private readonly auditService: AuditService,
  ) {}

  async getComparisonDetail(req: Request, res: Response) {
    logger.debug('GET /comparison')
    const prisoners: PrisonerDetailDto[] = await this.getPrisonerDetail(req, res)
    await this.auditService.logPageView(Page.COMPARISON, {
      who: res.locals.user.username,
      subjectId: prisoners.map(({ prisonNumber }) => prisonNumber).join(','),
      correlationId: req.id,
    })
    if (prisoners.length === 0) {
      return res.redirect('/search/results')
    }
    return res.render('pages/comparison', { prisoners })
  }

  async getPrisonerDetail(req: Request, res: Response): Promise<PrisonerDetailDto[]> {
    const { shortlist } = req.session
    const results = []

    if (shortlist && shortlist.length <= 3) {
      const promises = shortlist.map(prisonerNo =>
        this.historicalPrisonerService.getPrisonerDetail(res.locals.user.token, prisonerNo),
      )
      results.push(...(await Promise.all(promises)))
    }
    return results
  }

  addToShortlist(req: Request, res: Response) {
    if (req.body.view) return res.redirect('/comparison')

    req.session.shortlist ??= []
    if (req.body.add) {
      // already max items in shortlist - no more can be added
      if (req.session.shortlist.length < 3) {
        req.session.shortlist.push(req.body.prisoner)
      }
    } else {
      req.session.shortlist = req.session.shortlist.filter(item => item !== req.body.prisoner)
      if (req.body.comparison) {
        return res.redirect('/comparison')
      }
    }

    return res.redirect('/search/results')
  }
}
