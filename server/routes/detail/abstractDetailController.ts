import { Request, Response } from 'express'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import { PrisonerDetailDto } from '../../@types/historical-prisoner/historicalPrisonerApiTypes'

export default abstract class AbstractDetailController {
  protected constructor(protected readonly historicalPrisonerService: HistoricalPrisonerService) {}

  protected async getPrisonerDetail(req: Request, res: Response): Promise<PrisonerDetailDto> {
    const prisonNo = req.params.prisonNo.toString()
    if (prisonNo !== req.session.prisonerDetail?.prisonNumber) {
      // update session if we don't have the correct or any prison details
      req.session.prisonerDetail = await this.historicalPrisonerService.getPrisonerDetail(
        res.locals.user.token,
        prisonNo,
      )
    }
    return req.session.prisonerDetail
  }
}
