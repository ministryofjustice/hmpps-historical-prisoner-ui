import querystring from 'querystring'
import { ApiConfig, RestClient, asUser } from '@ministryofjustice/hmpps-rest-client'

import {
  FindPrisonersByAddress,
  FindPrisonersByIdentifiers,
  FindPrisonersByName,
  PagedModelPrisonerSearchDto,
  PrisonerDetailDto,
} from '../@types/historical-prisoner/historicalPrisonerApiTypes'
import logger from '../../logger'
import config from '../config'

export default class HistoricalPrisonerApiClient extends RestClient {
  constructor() {
    super('Historical Prisoner Api Client', config.apis.historicalPrisonerApi as ApiConfig, logger)
  }

  async findPrisonersByName(
    token: string,
    prisonersByNameForm: FindPrisonersByName,
    page?: number,
  ): Promise<PagedModelPrisonerSearchDto> {
    return this.get<PagedModelPrisonerSearchDto>(
      {
        path: '/search',
        query: querystring.stringify({ ...prisonersByNameForm, page }),
      },
      asUser(token),
    )
  }

  async findPrisonersByIdentifiers(
    token: string,
    prisonersByIdentifiersForm: FindPrisonersByIdentifiers,
    page?: number,
  ): Promise<PagedModelPrisonerSearchDto> {
    return this.get<PagedModelPrisonerSearchDto>(
      {
        path: '/identifiers',
        query: querystring.stringify({ ...prisonersByIdentifiersForm, page }),
      },
      asUser(token),
    )
  }

  async findPrisonersByAddressTerms(
    token: string,
    prisonersByAddress: FindPrisonersByAddress,
    page?: number,
  ): Promise<PagedModelPrisonerSearchDto> {
    return this.get<PagedModelPrisonerSearchDto>(
      {
        path: '/address-lookup',
        query: querystring.stringify({ ...prisonersByAddress, page }),
      },
      asUser(token),
    )
  }

  async getPrisonerDetail(token: string, prisonNumber: string): Promise<PrisonerDetailDto> {
    return this.get<PrisonerDetailDto>({ path: `/detail/${prisonNumber}` }, asUser(token))
  }
}
