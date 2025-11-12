import { Request, Response } from 'express'
import DisclaimerController from './disclaimerController'

const controller = new DisclaimerController()

describe('Disclaimer controller', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
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

  describe('getDisclaimer', () => {
    it('should render disclaimer page if disclaimer not confirmed', async () => {
      await controller.getDisclaimer(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/disclaimer')
    })

    it('should redirect to search if disclaimer already confirmed', async () => {
      req.session.disclaimerConfirmed = true

      await controller.getDisclaimer(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/search')
    })
  })

  describe('postDisclaimer', () => {
    it('should redirect to search on successful form submission', async () => {
      req.body.disclaimer = 'on'

      await controller.postDisclaimer(req, res)

      expect(req.session.disclaimerConfirmed).toBe(true)
      expect(res.redirect).toHaveBeenCalledWith('/search')
    })

    it('should return 400 and render view with error if disclaimer not confirmed', async () => {
      await controller.postDisclaimer(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.render).toHaveBeenCalledWith('pages/disclaimer', {
        errors: [{ href: '#disclaimer', text: 'You must confirm that you understand the disclaimer' }],
      })
    })
  })
})
