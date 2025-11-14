import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  export interface PrisonerSearchForm {
    searchType: string
    firstName?: string
    lastName?: string
    dobDay?: string
    dobMonth?: string
    dobYear?: string
    age?: string

    prisonNumber?: string
    pncNumber?: string
    croNumber?: string

    address?: string
  }

  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    disclaimerConfirmed: boolean
    prisonerSearchForm: PrisonerSearchForm
    searchParams: SearchParams
    shortlist: string[] | null
    prisonerDetail: PrisonerDetailDto
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: HmppsUser
    }

    interface Response {
      renderPdf(
        pageView: string,
        headerView: string,
        footerView: string,
        pageData: PdfPageData,
        options: { filename: string },
      ): void
    }
  }
}
type SearchParams = Partial<{
  filters: string[] | null
  page: number
}>
