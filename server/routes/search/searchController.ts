import { Request, Response } from 'express'
import { PrisonerSearchForm } from 'express-session'
import HistoricalPrisonerService from '../../services/historicalPrisonerService'
import AuditService, { Page } from '../../services/auditService'
import trimForm from '../../utils/trim'
import searchValidator from './searchValidator'

import {
  FindPrisonersByAddress,
  FindPrisonersByIdentifiers,
  FindPrisonersByName,
  PagedModelPrisonerSearchDto,
  PageMetaData,
} from '../../@types/historical-prisoner/historicalPrisonerApiTypes'
import { LegacyPagination, pagination } from '../../utils/pagination'
import getSearchSuggestions from '../../utils/suggestionHelpers'

export default class SearchController {
  constructor(
    private readonly historicalPrisonerService: HistoricalPrisonerService,
    private readonly auditService: AuditService,
  ) {}

  async clearSearch(req: Request, res: Response): Promise<void> {
    req.session.searchParams = {}

    return res.render('pages/search', { form: { searchType: 'name' } })
  }

  async getSearch(req: Request, res: Response): Promise<void> {
    if (!req.session.prisonerSearchForm) {
      return res.render('pages/search', { form: { searchType: 'name' } })
    }
    if (!req.session.searchParams) req.session.searchParams = {}

    const { page } = req.query
    req.session.searchParams.filters = this.getFiltersFromQuery(req)

    if (page) {
      req.session.searchParams.page = Number(page) - 1
    }
    const { page: resultsPage, content }: PagedModelPrisonerSearchDto = await this.doSearch(req, res)
    await this.auditService.logPageView(Page.SEARCH_RESULTS, {
      who: res.locals.user.username,
      subjectId: `Search by ${req.session.prisonerSearchForm.searchType}`,
      details: { prisonNumbers: content?.map(prisoner => prisoner.prisonNumber) },
      correlationId: req.id,
    })
    const paginationParams = this.getPaginationParams(req, resultsPage, this.getSessionFilterString(req))

    if (req.session.prisonerSearchForm.searchType === undefined) {
      req.session.prisonerSearchForm = { searchType: 'name' }
    }
    return res.render('pages/search', {
      searchResults: content?.map(prisoner => {
        return { ...prisoner, shortlisted: req.session.shortlist?.includes(prisoner.prisonNumber) }
      }),
      form: req.session.prisonerSearchForm,
      paginationParams,
      filters: req.session.searchParams.filters,
      shortlist: req.session.shortlist,
      suggestions: getSearchSuggestions(req.session.prisonerSearchForm),
    })
  }

  postSearch(req: Request, res: Response) {
    req.session.prisonerSearchForm = { ...trimForm(req.body) }

    const errors = searchValidator(req.session.prisonerSearchForm)
    if (errors.length) {
      return res.render('pages/search', {
        form: req.session.prisonerSearchForm,
        errors,
      })
    }

    // Ensure that the searchParams are cleared
    req.session.searchParams = { filters: [], page: 0 }

    return res.redirect('/search/results')
  }

  async doSearch(req: Request, res: Response): Promise<PagedModelPrisonerSearchDto> {
    const { prisonerSearchForm } = req.session
    const searchParams = req.session.searchParams || {}

    switch (prisonerSearchForm?.searchType) {
      case 'name':
        return this.historicalPrisonerService.findPrisonersByName(
          res.locals.user.token,
          SearchController.toPrisonersByName(prisonerSearchForm, searchParams.filters),
          searchParams.page,
        )
      case 'identifier':
        return this.historicalPrisonerService.findPrisonersByIdentifiers(
          res.locals.user.token,
          SearchController.toPrisonersByIdentifiers(prisonerSearchForm, searchParams.filters),
          searchParams.page,
        )
      case 'address':
        return this.historicalPrisonerService.findPrisonersByAddressTerms(
          res.locals.user.token,
          SearchController.toPrisonersByAddress(prisonerSearchForm, searchParams.filters),
          searchParams.page,
        )
      default:
        throw new Error(`Unknown search type: ${prisonerSearchForm?.searchType}`)
    }
  }

  getSessionFilterString(req: Request): string {
    const searchParams = new URLSearchParams()

    req.session.searchParams?.filters?.forEach(entry => {
      searchParams.append('filters', entry)
    })
    return searchParams?.toString() ?? ''
  }

  getFiltersFromQuery(req: Request): string[] {
    const { filters } = req.query
    if (filters) {
      if (Array.isArray(filters)) {
        return filters as string[]
      }
      return [filters as string]
    }
    return []
  }

  getPaginationParams(_req: Request, page: PageMetaData, filters: string): LegacyPagination {
    const paginationUrlPrefix = filters === '' ? '/search/results?' : `/search/results?${filters}&`

    const paginationParams = pagination(
      (page.number || 0) + 1,
      page.totalPages || 0,
      paginationUrlPrefix,
      'moj',
      page.totalElements || 0,
      page.size || 0,
    )
    if (!paginationParams.results) paginationParams.results = { count: 0, from: 0, to: 0 }
    paginationParams.results.text = page.totalElements === 1 ? 'prisoner' : 'prisoners'
    return paginationParams
  }

  private static toPrisonersByName(form: PrisonerSearchForm, filters?: string[] | null): FindPrisonersByName {
    const hasDateField = form.dobDay && form.dobMonth && form.dobYear
    let gender: string
    if (filters) {
      if (filters.includes('male') && !filters.includes('female')) gender = 'M'
      else if (!filters.includes('male') && filters.includes('female')) gender = 'F'
    }

    return {
      forename: form.firstName,
      surname: form.lastName,
      dateOfBirth: hasDateField
        ? [form.dobYear, form.dobMonth.padStart(2, '0'), form.dobDay.padStart(2, '0')].join('-')
        : undefined,
      ageFrom: Number(form.age?.split('-')[0]) || Number(form.age) || undefined,
      ageTo: Number(form.age?.split('-')[1]) || undefined,
      gender,
      hdc: filters?.includes('hdc') ? true : undefined,
      lifer: filters?.includes('lifer') ? true : undefined,
    }
  }

  private static toPrisonersByIdentifiers(
    form: PrisonerSearchForm,
    filters?: string[] | null,
  ): FindPrisonersByIdentifiers {
    return {
      prisonNumber: form.prisonNumber,
      pnc: form.pncNumber,
      cro: form.croNumber,

      gender: undefined,
      hdc: filters?.includes('hdc') ? true : undefined,
      lifer: filters?.includes('lifer') ? true : undefined,
    }
  }

  private static toPrisonersByAddress(form: PrisonerSearchForm, filters?: string[] | null): FindPrisonersByAddress {
    return {
      addressTerms: form.address,

      gender: undefined,
      hdc: filters?.includes('hdc') ? true : undefined,
      lifer: filters?.includes('lifer') ? true : undefined,
    }
  }
}
