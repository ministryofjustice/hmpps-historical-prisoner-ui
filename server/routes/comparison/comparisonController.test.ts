import { Request, Response } from 'express'

import DetailController from './comparisonController'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import auditServiceMock from '../../testutils/auditServiceMock'

jest.mock('../../services/historicalPrisonerService')
const historicalPrisonerService = new HistoricalPrisonerService(null) as jest.Mocked<HistoricalPrisonerService>
const auditService = auditServiceMock()
const controller = new DetailController(historicalPrisonerService, auditService)

describe('Comparison controller', () => {
  let req: Request
  let res: Response

  const prisoner1Detail = { prisonNumber: 'AB12345', summary: { firstName: 'JOHN', lastName: 'SMITH' } }
  const prisoner2Detail = { prisonNumber: 'ZZ54321', summary: { firstName: 'FRED', lastName: 'JAMES' } }
  const prisoner3Detail = { prisonNumber: 'MC98765', summary: { firstName: 'BERT', lastName: 'SCOTT' } }

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      user: { token: 'token' },
      session: {},
      body: {},
    } as unknown as Request
    res = {
      locals: { user: { username: 'user' } },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    } as unknown as Response
  })

  describe('getComparisonDetails', () => {
    it('should retrieve prisoner detail and render the comparison page for multiple prisoners', async () => {
      historicalPrisonerService.getPrisonerDetail
        .mockResolvedValueOnce(prisoner1Detail)
        .mockResolvedValueOnce(prisoner2Detail)
        .mockResolvedValue(prisoner3Detail)

      req.session.shortlist = ['AB12345', 'ZZ54321', 'MC98765']

      await controller.getComparisonDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'AB12345')
      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'ZZ54321')
      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'MC98765')
      expectRenderComparisonContainingDetail([prisoner1Detail, prisoner2Detail, prisoner3Detail])
    })

    it('should retrieve prisoner detail and render the comparison page', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(prisoner1Detail)
      req.session.shortlist = [prisoner1Detail.prisonNumber]

      await controller.getComparisonDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'AB12345')
      expectRenderComparisonContainingDetail()
      expect(req.session.shortlist).toStrictEqual([prisoner1Detail.prisonNumber])
    })

    it('should return empty list if no prisoners to compare', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(prisoner1Detail)
      req.session.shortlist = []

      await controller.getComparisonDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should return empty list if >3 prisoners to compare', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(prisoner1Detail)
      req.session.shortlist = ['AB12345', 'ZZ54321', 'MC98765', 'AA56789']

      await controller.getComparisonDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should audit details viewed', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(prisoner1Detail)
      req.session.shortlist = [prisoner1Detail.prisonNumber]
      req.id = 'COR_ID'

      await controller.getComparisonDetail(req, res)

      expect(auditService.logPageView).toHaveBeenCalledWith('COMPARISON', {
        who: 'user',
        subjectId: 'AB12345',
        correlationId: 'COR_ID',
      })
      expectRenderComparisonContainingDetail()
    })
  })

  describe('addToShortlist', () => {
    it('should initialize shortlist if undefined and add a prisoner', () => {
      req.body = { add: true, prisoner: 'AB12345' }
      req.session.shortlist = undefined

      controller.addToShortlist(req, res)

      expect(req.session.shortlist).toEqual(['AB12345'])
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should add a prisoner to the shortlist if not already present', () => {
      req.body = { add: true, prisoner: 'ZZ54321' }
      req.session.shortlist = ['AB12345']

      controller.addToShortlist(req, res)

      expect(req.session.shortlist).toEqual(['AB12345', 'ZZ54321'])
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should not add a prisoner if shortlist already has 3 items', () => {
      req.body = { add: true, prisoner: 'MC98765' }
      req.session.shortlist = ['AB12345', 'ZZ54321', 'XY12345']

      controller.addToShortlist(req, res)

      expect(req.session.shortlist).toEqual(['AB12345', 'ZZ54321', 'XY12345'])
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should remove a prisoner from the shortlist', () => {
      req.body = { remove: true, prisoner: 'ZZ54321' }
      req.session.shortlist = ['AB12345', 'ZZ54321']

      controller.addToShortlist(req, res)

      expect(req.session.shortlist).toEqual(['AB12345'])
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should redirect to /comparison if view is true', () => {
      req.body = { view: true }

      controller.addToShortlist(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/comparison')
    })
  })

  function expectRenderComparisonContainingDetail(prisonerDetails = [prisoner1Detail]) {
    expect(res.render).toHaveBeenCalledWith('pages/comparison', expect.objectContaining({ prisoners: prisonerDetails }))
  }
})
