import { Request, Response } from 'express'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import AuditService, { Page } from '../../services/auditService'
import HmppsError from '../../interfaces/HmppsError'
import AbstractDetailController from '../detail/abstractDetailController'

type ItemType = { value: string; text: string }
type ItemTypeWithAll = { divider?: string; value?: string; text?: string; behaviour?: string }

const items: ItemType[] = [
  { value: 'summary', text: 'Subject' },
  { value: 'sentenceSummary', text: 'Sentence summary' },
  { value: 'sentencing', text: 'Sentence history' },
  { value: 'courtHearings', text: 'Court hearings' },
  { value: 'movements', text: 'Movements' },
  { value: 'hdc', text: 'HDC history' },
  { value: 'offences', text: 'Offences' },
  { value: 'offencesInCustody', text: 'Offences in custody' },
  { value: 'aliases', text: 'Aliases' },
  { value: 'addresses', text: 'Addresses' },
]
const orAll: ItemTypeWithAll[] = [
  { divider: 'or' },
  { value: 'all', text: 'All, I would like all details', behaviour: 'exclusive' },
]
const itemsWithAll: ItemTypeWithAll[] = [...items, ...orAll]

type PageData = {
  errors?: HmppsError[]
}

export default class PrintController extends AbstractDetailController {
  constructor(
    historicalPrisonerService: HistoricalPrisonerService,
    private readonly auditService: AuditService,
  ) {
    super(historicalPrisonerService)
  }

  async getPrintForm(req: Request, res: Response): Promise<void> {
    return this.renderView(req, res)
  }

  async postPrintForm(req: Request, res: Response): Promise<void> {
    const { section } = req.body
    if (!section) {
      res.status(400)
      const errors: HmppsError[] = [{ href: '#section', text: 'Please select at least one section to print' }]
      return this.renderView(req, res, { errors })
    }
    const { prisonNo } = req.params
    if (Array.isArray(section)) {
      const sections = new URLSearchParams(section.map(s => ['section', s] as [string, string]))
      return res.redirect(`/print/${prisonNo}/pdf?${sections.toString()}`)
    }
    return res.redirect(`/print/${prisonNo}/pdf${section === 'all' ? '' : `?section=${section}`}`)
  }

  async renderPdf(req: Request, res: Response): Promise<void> {
    const prisonerDetail = await this.getPrisonerDetail(req, res)
    await this.auditService.logPageView(Page.PRINT, {
      who: res.locals.user.username,
      subjectId: prisonerDetail.prisonNumber,
      correlationId: req.id,
    })
    const sections = this.getSections(req).reduce((acc: Record<string, boolean>, key: string) => {
      acc[key] = true
      return acc
    }, {})
    res.renderPdf(
      `pages/pdf`,
      `pages/pdfHeader`,
      `pages/pdfFooter`,
      { sections, ...prisonerDetail },
      { filename: `print-${req.params.prisonNo}.pdf` },
    )
  }

  private getSections(req: Request): string[] {
    const { section } = req.query
    if (!section) return items.map(({ value }) => value)
    return Array.isArray(section) ? section.map(value => value.toString()) : [section.toString()]
  }

  async renderView(req: Request, res: Response, pageData?: PageData): Promise<void> {
    const prisonerDetail = await this.getPrisonerDetail(req, res)
    res.render('pages/print', { summary: prisonerDetail.summary, items: itemsWithAll, ...pageData })
  }
}
