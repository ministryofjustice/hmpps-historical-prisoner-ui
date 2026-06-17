import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import HistoricalPrisonerApiClient from './historicalPrisonerApiClient'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  historicalPrisonerApiClient: new HistoricalPrisonerApiClient(),
})

export { HmppsAuditClient }
