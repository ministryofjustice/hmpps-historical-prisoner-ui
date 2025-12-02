import { expect, test } from '@playwright/test'

import hmppsAuth from '../mockApis/hmppsAuth'
import tokenVerification from '../mockApis/tokenVerification'
import historicalPrisonerApi from '../mockApis/historicalPrisoner'
import gotenbergApi from '../mockApis/gotenberg'

import { resetStubs } from '../testUtils'

test.describe('Health', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('All healthy', () => {
    test.beforeEach(async () => {
      await Promise.all([
        hmppsAuth.stubPing(),
        historicalPrisonerApi.stubPing(),
        tokenVerification.stubPing(),
        gotenbergApi.stubPing(),
      ])
    })

    test('Health check is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Reports historical prisoner as UP', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.components.historicalPrisonerApi.status).toBe('UP')
    })

    test('Ping is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/ping')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Info is accessible', async ({ page }) => {
      const response = await page.request.get('/info')
      const payload = await response.json()
      expect(payload.build.name).toBe('hmpps-historical-prisoner-ui')
    })
  })

  test.describe('Some unhealthy', () => {
    test.beforeEach(async () => {
      await Promise.all([
        hmppsAuth.stubPing(),
        historicalPrisonerApi.stubPing(),
        tokenVerification.stubPing(500),
        gotenbergApi.stubPing(),
      ])
    })

    test('Health check status is down', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('DOWN')
      expect(payload.components.hmppsAuth.status).toBe('UP')
      expect(payload.components.historicalPrisonerApi.status).toBe('UP')
      expect(payload.components.tokenVerification.status).toBe('DOWN')
      expect(payload.components.tokenVerification.details.status).toBe(500)
      expect(payload.components.tokenVerification.details.attempts).toBe(3)
      expect(payload.components.gotenberg.status).toBe('UP')
    })
  })
})
