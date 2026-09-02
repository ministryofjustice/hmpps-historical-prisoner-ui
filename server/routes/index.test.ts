import type { Express } from 'express'
import { AuditService } from '@ministryofjustice/hmpps-audit-client'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import HistoricalPrisonerService from '../services/historicalPrisonerService'
import HistoricalPrisonerApiClient from '../data/historicalPrisonerApiClient'

jest.mock('@ministryofjustice/hmpps-audit-client')
jest.mock('../services/historicalPrisonerService')

const auditService = new AuditService({} as never) as jest.Mocked<AuditService>
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
