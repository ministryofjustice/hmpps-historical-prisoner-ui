import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService from '../services/auditService'
import HistoricalPrisonerService from '../services/historicalPrisonerService'
import HmppsAuditClient from '../data/hmppsAuditClient'
import HistoricalPrisonerApiClient from '../data/historicalPrisonerApiClient'

jest.mock('../services/auditService')
jest.mock('../services/historicalPrisonerService')

const auditService = new AuditService({} as HmppsAuditClient) as jest.Mocked<AuditService>
const historicalPrisonerService = new HistoricalPrisonerService(
  {} as HistoricalPrisonerApiClient,
) as jest.Mocked<HistoricalPrisonerService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      historicalPrisonerService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should redirect to disclaimer page', () => {
    return request(app)
      .get('/')
      .expect(res => {
        expect(res.text).toContain('Redirecting to /search')
      })
  })
})
