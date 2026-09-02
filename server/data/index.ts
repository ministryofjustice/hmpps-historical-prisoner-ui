import HistoricalPrisonerApiClient from './historicalPrisonerApiClient'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => ({
  applicationInfo,
  historicalPrisonerApiClient: new HistoricalPrisonerApiClient(),
})

export { HistoricalPrisonerApiClient }
