import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'
import { dataAccess } from '../data'
import HistoricalPrisonerService from './historicalPrisonerService'
import logger from '../../logger'
import config from '../config'

export const services = () => {
  const { applicationInfo, historicalPrisonerApiClient } = dataAccess()

  const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)

  return {
    applicationInfo,
    auditService,
    historicalPrisonerService: new HistoricalPrisonerService(historicalPrisonerApiClient),
  }
}

export type Services = ReturnType<typeof services>
