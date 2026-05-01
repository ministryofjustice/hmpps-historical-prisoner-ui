import {
  FindPrisonersByAddress,
  FindPrisonersByIdentifiers,
  FindPrisonersByName,
  PagedModelPrisonerSearchDto,
  PrisonerDetailDto,
} from '../@types/historical-prisoner/historicalPrisonerApiTypes'
import HistoricalPrisonerApiClient from '../data/historicalPrisonerApiClient'

export default class HistoricalPrisonerService {
  constructor(private readonly apiClient: HistoricalPrisonerApiClient) {}

  async findPrisonersByName(
    token: string,
    prisonersByNameForm: FindPrisonersByName,
    page?: number,
  ): Promise<PagedModelPrisonerSearchDto> {
    return this.apiClient.findPrisonersByName(token, prisonersByNameForm, page)
  }

  async findPrisonersByIdentifiers(
    token: string,
    prisonersByIdentifiersForm: FindPrisonersByIdentifiers,
    page?: number,
  ): Promise<PagedModelPrisonerSearchDto> {
    return this.apiClient.findPrisonersByIdentifiers(token, prisonersByIdentifiersForm, page)
  }

  async findPrisonersByAddressTerms(
    token: string,
    prisonersByAddress: FindPrisonersByAddress,
    page?: number,
  ): Promise<PagedModelPrisonerSearchDto> {
    return this.apiClient.findPrisonersByAddressTerms(token, prisonersByAddress, page)
  }

  async getPrisonerDetail(token: string, prisonNumber: string): Promise<PrisonerDetailDto> {
    return this.apiClient.getPrisonerDetail(token, prisonNumber)
  }
}
