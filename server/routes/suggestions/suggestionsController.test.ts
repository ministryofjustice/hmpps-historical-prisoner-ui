import { Request, Response } from 'express'

import SuggestionsController from './suggestionsController'

const controller = new SuggestionsController()

describe('Suggestions controller', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      user: { token: 'token' },
      session: {},
      body: {},
    } as unknown as Request
    res = {
      locals: { user: { username: 'user' } },
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
    } as unknown as Response
  })

  describe('getSuggestions', () => {
    it('should render the suggestions page', () => {
      req.session.prisonerSearchForm = { searchType: 'name' }
      controller.getSuggestions(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/suggestion', { suggestions: [] })
    })

    it('should render the suggestions page even when no search form', () => {
      controller.getSuggestions(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/suggestion', { suggestions: [] })
      expect(req.session.prisonerSearchForm).toEqual({ searchType: 'name' })
    })
  })

  describe('applySuggestions', () => {
    it('should apply the suggestions even if no search form', () => {
      req.query = { firstName: 'Smith', lastName: 'John' }
      controller.applySuggestions(req, res)

      expect(req.session.prisonerSearchForm).toEqual({
        searchType: 'name',
        firstName: 'Smith',
        lastName: 'John',
      })
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })
    it('should re-render the search page with new first name', () => {
      req.session.prisonerSearchForm = { searchType: 'name', firstName: 'James', lastName: 'Smith', age: '20-25' }
      req.query = { firstName: 'Smith', lastName: 'John' }
      controller.applySuggestions(req, res)

      expect(req.session.prisonerSearchForm).toEqual({
        searchType: 'name',
        firstName: 'Smith',
        lastName: 'John',
        age: '20-25',
      })
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })
    it('should re-render the search page with new last name', () => {
      req.session.prisonerSearchForm = { searchType: 'name', firstName: 'John', lastName: 'Brown', age: '20-25' }
      req.query = { firstName: 'Smith', lastName: 'John' }
      controller.applySuggestions(req, res)

      expect(req.session.prisonerSearchForm).toEqual({
        searchType: 'name',
        firstName: 'Smith',
        lastName: 'John',
        age: '20-25',
      })
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })
    it('should re-render the search page with new first and last name', () => {
      req.session.prisonerSearchForm = { searchType: 'name', firstName: 'John', lastName: 'Smith', age: '20-25' }
      req.query = { firstName: 'Smith', lastName: 'John' }
      controller.applySuggestions(req, res)

      expect(req.session.prisonerSearchForm).toEqual({
        searchType: 'name',
        firstName: 'Smith',
        lastName: 'John',
        age: '20-25',
      })
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })
    it('should re-render the search page with age', () => {
      req.session.prisonerSearchForm = { searchType: 'name' }
      req.query = { age: '12-15', firstName: 'John', lastName: 'Smith' }
      controller.applySuggestions(req, res)

      expect(req.session.prisonerSearchForm).toEqual({
        searchType: 'name',
        age: '12-15',
        firstName: 'John',
        lastName: 'Smith',
      })
      expect(res.redirect).toHaveBeenCalledWith('/search/results')
    })
  })
  it('should re-render the search page with empty last Name', () => {
    req.session.prisonerSearchForm = { searchType: 'name', firstName: 'James', lastName: 'Smith', age: '20-25' }
    req.query = { firstName: 'Smith', lastName: '' }
    controller.applySuggestions(req, res)

    expect(req.session.prisonerSearchForm).toEqual({
      searchType: 'name',
      firstName: 'Smith',
      lastName: '',
      age: '20-25',
    })
    expect(res.redirect).toHaveBeenCalledWith('/search/results')
  })
})
