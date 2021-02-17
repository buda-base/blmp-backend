import express from 'express';
import personCtrl from './person.controller';
import { checkJwt, scopesJwt } from '../../helpers/auth';

const router = express.Router(); // eslint-disable-line new-cap

const config = require('../../../config/env');

if (!config.requireAuth) {
  router
  .get('/', personCtrl.mocklist)
  .post('/', personCtrl.create)

  router
  .get('/:id', personCtrl.get)
  .put('/:id', personCtrl.update)
  .delete('/:id', personCtrl.remove)
} else {
  router.route('/')
  /**
  * @api {get} /api/persons Get list of persons
  * @apiName List Persons
  * @apiGroup Person
  * @apiPermission bdrc-admin
  */
    .get(checkJwt, scopesJwt, personCtrl.mocklist)

  /**
  * @api {post} /api/persons Create new Person
  * @apiName CreatePerson
  * @apiGroup Person
  * @apiPermission bdrc-admin
  */
    .post(checkJwt, scopesJwt, personCtrl.create);

  router.route('/:id')
    /**
    * @api {get} /api/persons/:id  Get Person
    * @apiName Get Person
    * @apiGroup Person
    * @apiPermission bdrc-admin
    * @apiParam  {String} id Person id
    */
    .get(checkJwt, scopesJwt, personCtrl.get)

    /**
    * @api {put} /api/persons/:id  Update Person
    * @apiName Update Person
    * @apiGroup Person
    * @apiPermission bdrc-admin
    * @apiParam  {String} id Person id
    */
    .put(checkJwt, scopesJwt, personCtrl.update)

    /**
    * @api {delete} /api/persons/:id  Delete Person
    * @apiName Delete Person
    * @apiGroup Person
    * @apiPermission bdrc-admin
    * @apiParam  {String} id Person id
    */
    .delete(checkJwt, scopesJwt, personCtrl.remove);
}

export default router;
