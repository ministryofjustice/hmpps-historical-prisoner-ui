import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'

jest.mock('@ministryofjustice/hmpps-audit-client')

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /disclaimer', () => {
  it('should render index/disclaimer page', () => {
    return request(app)
      .get('/disclaimer')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Usage')
      })
  })
})
