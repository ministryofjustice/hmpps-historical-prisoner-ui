import { Router } from 'express'
import DisclaimerController from './disclaimerController'

export default function routes(router: Router): Router {
  const disclaimerController = new DisclaimerController()

  router.get('/disclaimer', async (req, res) => disclaimerController.getDisclaimer(req, res))
  router.post('/disclaimer', async (req, res) => disclaimerController.postDisclaimer(req, res))

  return router
}
