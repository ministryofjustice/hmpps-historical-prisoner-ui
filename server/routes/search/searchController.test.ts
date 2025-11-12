import { Request, Response } from 'express'

import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import auditServiceMock from '../../testutils/auditServiceMock'
import SearchController from './searchController'

jest.mock('../../services/historicalPrisonerService')
const historicalPrisonerService = new HistoricalPrisonerService(null) as jest.Mocked<HistoricalPrisonerService>
const auditService = auditServiceMock()
const controller = new SearchController(historicalPrisonerService, auditService)

describe('SearchPage controller', () => {
  let req: Request
  let res: Response

  const results = {
    content: [
      {
        prisonNumber: 'BF123455',
        lastName: 'WILSON',
        firstName: 'GOLDIE',
        middleName: '',
        isAlias: false,
        receptionDate: '1955-11-12',
        aliasLast: 'WILSON',
        aliasFirst: 'GOLDIE',
        aliasMiddle: '',
        dob: '1967-01-05',
      },
      {
        prisonNumber: 'BF123455',
        lastName: 'WILSON',
        firstName: 'MAYOR',
        middleName: '',
        isAlias: true,
        receptionDate: '1955-11-12',
        aliasLast: 'WILSON',
        aliasFirst: 'GOLDIE',
        aliasMiddle: '',
        dob: '1967-01-05',
      },
    ],
    page: {
      size: 20,
      number: 0,
      totalElements: 2,
      totalPages: 1,
    },
  }

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

  describe('new SearchPage', () => {
    it('should render the search page', async () => {
      await controller.clearSearch(req, res)

      expect(historicalPrisonerService.findPrisonersByName).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/search', { form: { searchType: 'name' } })
    })
    it('should not audit search', async () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      controller.postSearch(req, res)

      expect(auditService.logPageView).not.toHaveBeenCalled()
    })
  })

  describe('postSearch', () => {
    it('should render search page with error if error returned if no search type set', () => {
      controller.postSearch(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search', {
        errors: [{ href: '#searchType', text: 'Enter a valid search type' }],
        form: {},
      })
    })

    it('should render the search page with error if no data set', () => {
      req.body = { searchType: 'name' }
      controller.postSearch(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search', {
        errors: [{ href: '', text: 'Please enter a value for at least one Name/age field' }],
        form: { searchType: 'name' },
      })
    })

    it('should call redirect to search results if validation passes', () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      controller.postSearch(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })

    it('should add the prisonerSearchForm data to the session', () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      historicalPrisonerService.findPrisonersByName.mockResolvedValue(results)
      controller.postSearch(req, res)

      expect(req.session.prisonerSearchForm).toEqual({ searchType: 'name', lastName: 'WILSON' })
    })

    it('should clear search params if validation passes', () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      controller.postSearch(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/search/results')
      expect(req.session.searchParams).toEqual({ filters: [], page: 0 })
    })
  })

  describe('getSearch', () => {
    it('should render the search page with default searchType if no data in the session', async () => {
      req.session.searchParams = {}
      await controller.getSearch(req, res)

      expect(historicalPrisonerService.findPrisonersByName).not.toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/search', { form: { searchType: 'name' } })
    })

    it('should render the search page passing through filter data', async () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      req.session.searchParams = {}
      req.session.prisonerSearchForm = { searchType: 'name' }
      req.query = { filters: 'female' }
      historicalPrisonerService.findPrisonersByName.mockResolvedValue(results)
      await controller.getSearch(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search', expect.objectContaining({ filters: ['female'] }))
    })

    it('should render the search page with page parameters', async () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      req.session.searchParams = {}
      req.session.prisonerSearchForm = { searchType: 'name' }
      req.query = { filters: 'female' }
      historicalPrisonerService.findPrisonersByName.mockResolvedValue(results)
      await controller.getSearch(req, res)

      expect(historicalPrisonerService.findPrisonersByName).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith(
        'pages/search',
        expect.objectContaining({
          paginationParams: { items: [], results: { count: 2, from: 1, to: 2, text: 'prisoners' } },
        }),
      )
    })

    it('should audit details viewed', async () => {
      req.body = { searchType: 'name', lastName: 'WILSON' }
      req.session.searchParams = {}
      req.session.prisonerSearchForm = { searchType: 'name', firstName: 'GOLDIE', lastName: 'WILSON' }
      req.query = { filters: 'female' }
      req.id = 'COR_ID'
      historicalPrisonerService.findPrisonersByName.mockResolvedValue(results)
      await controller.getSearch(req, res)

      expect(auditService.logPageView).toHaveBeenCalledWith('SEARCH_RESULTS', {
        who: 'user',
        subjectId: 'SearchPage by name',
        details: { prisonNumbers: ['BF123455', 'BF123455'] },
        correlationId: 'COR_ID',
      })
    })
  })
})
