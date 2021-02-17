import express from 'express';
import resourceCtrl from './resource.controller';
import { checkJwt, scopesJwt } from '../../helpers/auth';

const router = express.Router(); // eslint-disable-line new-cap

const config = require('../../../config/env');

if (!config.requireAuth) {
  router
  .get('/', resourceCtrl.list)

  router
  .get('/:id', resourceCtrl.get)
} else {
  router.route('/')
  /**
  * @api {get} /api/resources Get list of resources
  * @apiName List Resources
  * @apiGroup Resource
  * @apiPermission bdrc-admin
  */
    .get(checkJwt, scopesJwt, resourceCtrl.list)

  router.route('/:id')
    /**
    * @api {get} /api/resources/:id  Get Resource
    * @apiName Get Resource
    * @apiGroup Resource
    * @apiPermission bdrc-admin
    * @apiParam  {String} id Resource id
    */
    .get(checkJwt, scopesJwt, resourceCtrl.get)
}

export default router;
