import { Request, Response } from 'express'

import DetailController from './detailController'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import auditServiceMock from '../../testutils/auditServiceMock'

jest.mock('../../services/historicalPrisonerService')
const historicalPrisonerService = new HistoricalPrisonerService(null) as jest.Mocked<HistoricalPrisonerService>
const auditService = auditServiceMock()
const controller = new DetailController(historicalPrisonerService, auditService)

describe('Detail controller', () => {
  let req: Request
  let res: Response

  const detail = { prisonNumber: 'AB12345', summary: { firstName: 'JOHN', lastName: 'SMITH' } }

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      user: { token: 'token' },
      session: {},
      body: {},
      query: jest.fn(),
    } as unknown as Request
    res = {
      locals: { user: { username: 'user' } },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    } as unknown as Response
  })

  describe('getDetail', () => {
    it('should retrieve prisoner detail and render the detail page if no session object', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'AB12345' }

      await controller.getDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'AB12345')
      expectRenderDetailContainingDetail()
      expect(req.session.prisonerDetail).toBe(detail)
    })

    it('should retrieve prisoner detail and render the detail page if session object contains different prisoner', async () => {
      historicalPrisonerService.getPrisonerDetail.mockResolvedValue(detail)
      req.params = { prisonNo: 'BC12345' }
      req.session.prisonerDetail = detail

      await controller.getDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).toHaveBeenCalledWith('token', 'BC12345')
      expectRenderDetailContainingDetail()
      expect(req.session.prisonerDetail).toBe(detail)
    })

    it('should just render the detail page if session object exists', async () => {
      req.params = { prisonNo: 'AB12345' }
      req.session.prisonerDetail = detail

      await controller.getDetail(req, res)

      expect(historicalPrisonerService.getPrisonerDetail).not.toHaveBeenCalled()
      expectRenderDetailContainingDetail()
    })

    it('should audit details viewed', async () => {
      req.params = { prisonNo: 'AB12345' }
      req.session.prisonerDetail = detail
      req.id = 'COR_ID'

      await controller.getDetail(req, res)

      expect(auditService.logPageView).toHaveBeenCalledWith('DETAIL', {
        who: 'user',
        subjectId: 'AB12345',
        correlationId: 'COR_ID',
      })
      expectRenderDetailContainingDetail()
    })
  })

  function expectRenderDetailContainingDetail() {
    expect(res.render).toHaveBeenCalledWith('pages/detail', expect.objectContaining({ ...detail }))
  }
})
