import { Request, Response } from 'express'

import PrintController from './printController'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import auditServiceMock from '../../testutils/auditServiceMock'
import { PrisonerDetailDto } from '../../@types/historical-prisoner/historicalPrisonerApiTypes'

jest.mock('../../services/historicalPrisonerService')
const historicalPrisonerService = new HistoricalPrisonerService(null) as jest.Mocked<HistoricalPrisonerService>
const auditService = auditServiceMock()
const controller = new PrintController(historicalPrisonerService, auditService)

describe('Print controller', () => {
  let req: Request
  let res: Response

  const detail = {
    prisonNumber: 'AB12345',
    summary: { firstName: 'JOHN', lastName: 'SMITH' },
    sentenceSummary: { establishment: 'HMP Wandsworth' },
    hdcInfo: [{ reasons: 'reasons' }],
  } as PrisonerDetailDto

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      user: { token: 'token' },
      session: {},
      body: {},
      query: {},
    } as unknown as Request
    res = {
      locals: { user: { username: 'user' } },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      renderPdf: jest.fn(),
    } as unknown as Response
  })

  describe('getPrintForm', () => {
    it('should retrieve prisoner detail and render the print page if no session object', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'AB12345' }

      await controller.getPrintForm(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'AB12345')
      expectRenderPrintContainingDetail()
      expect(req.session.prisonerDetail).toBe(detail)
    })

    it('should retrieve prisoner detail and render the print page if session object contains different prisoner', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'BC12345' }
      req.session.prisonerDetail = detail

      await controller.getPrintForm(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'BC12345')
      expectRenderPrintContainingDetail()
      expect(req.session.prisonerDetail).toBe(detail)
    })

    it('should just render the print page if session object exists', async () => {
      req.params = { prisonNo: 'AB12345' }
      req.session.prisonerDetail = detail

      await controller.getPrintForm(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).not.toHaveBeenCalled()
      expectRenderPrintContainingDetail()
    })

    it('should render the print page with items including all and or', async () => {
      req.params = { prisonNo: 'AB12345' }
      req.session.prisonerDetail = detail

      await controller.getPrintForm(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        'pages/print',
        expect.objectContaining({
          items: expect.arrayContaining([
            { value: 'summary', text: 'Subject' },
            { divider: 'or' },
            { value: 'all', text: 'All, I would like all details', behaviour: 'exclusive' },
          ]),
        }),
      )
    })
  })
  describe('postPrintForm', () => {
    describe('validation', () => {
      it('should retrieve prisoner detail and render the print page if no section passed through', async () => {
        historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
        req.params = { prisonNo: 'AB12345' }

        await controller.postPrintForm(req, res)

        expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'AB12345')
        expectRenderPrintContainingDetail()
      })

      it('should render error messages on the print page', async () => {
        req.params = { prisonNo: 'AB12345' }
        req.session.prisonerDetail = detail

        await controller.postPrintForm(req, res)

        expect(historicalPrisonerService.getPrisonerDetail).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith(
          'pages/print',
          expect.objectContaining({
            errors: [{ href: '#section', text: 'Please select at least one section to print' }],
          }),
        )
        expect(res.status).toHaveBeenCalledWith(400)
      })
    })

    describe('success', () => {
      it('should redirect to detail page for one section', async () => {
        req.params = { prisonNo: 'AB12345' }
        req.body.section = 'summary'

        await controller.postPrintForm(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/print/AB12345/pdf?section=summary')
      })

      it('should redirect to detail page for all sections', async () => {
        req.params = { prisonNo: 'AB12345' }
        req.body.section = 'all'

        await controller.postPrintForm(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/print/AB12345/pdf')
      })

      it('should redirect to detail page for multiple sections', async () => {
        req.params = { prisonNo: 'AB12345' }
        req.body.section = ['one', 'two']

        await controller.postPrintForm(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/print/AB12345/pdf?section=one&section=two')
      })
    })
  })

  describe('renderPdf', () => {
    it('should render PDF with correct parameters', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'AB12345' }

      await controller.renderPdf(req, res)

      expect(res.renderPdf).toHaveBeenCalledWith(
        'pages/pdf',
        'pages/pdfHeader',
        'pages/pdfFooter',
        {
          ...detail,
          sections: {
            addresses: true,
            aliases: true,
            courtHearings: true,
            hdc: true,
            movements: true,
            offences: true,
            offencesInCustody: true,
            sentenceSummary: true,
            sentencing: true,
            summary: true,
          },
        },
        { filename: 'print-AB12345.pdf' },
      )
    })
    it('should render PDF passing through relevant section', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'AB12345' }
      req.query = { section: 'summary' }

      await controller.renderPdf(req, res)

      expect(res.renderPdf).toHaveBeenCalledWith(
        'pages/pdf',
        'pages/pdfHeader',
        'pages/pdfFooter',
        { ...detail, sections: { summary: true } },
        { filename: 'print-AB12345.pdf' },
      )
    })

    it('should render PDF passing through multiple sections', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'AB12345' }
      req.query = { section: ['summary', 'sentenceSummary'] }

      await controller.renderPdf(req, res)

      expect(res.renderPdf).toHaveBeenCalledWith(
        'pages/pdf',
        'pages/pdfHeader',
        'pages/pdfFooter',
        { ...detail, sections: { summary: true, sentenceSummary: true } },
        { filename: 'print-AB12345.pdf' },
      )
    })
    it('should audit details viewed', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'AB12345' }
      req.query = { section: ['summary', 'sentenceSummary'] }
      req.id = 'COR_ID'

      await controller.renderPdf(req, res)

      expect(auditService.logPageView).toHaveBeenCalledWith('PRINT', {
        who: 'user',
        subjectId: 'AB12345',
        correlationId: 'COR_ID',
      })
      expect(res.renderPdf).toHaveBeenCalledWith(
        'pages/pdf',
        'pages/pdfHeader',
        'pages/pdfFooter',
        { ...detail, sections: { summary: true, sentenceSummary: true } },
        { filename: 'print-AB12345.pdf' },
      )
    })
  })

  function expectRenderPrintContainingDetail() {
    expect(res.render).toHaveBeenCalledWith('pages/print', expect.objectContaining({ summary: detail.summary }))
  }
})
