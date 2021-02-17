import express from 'express';
import userCtrl from './profile.controller';
import { checkJwt, scopesJwt } from '../../helpers/auth';

const router = express.Router(); // eslint-disable-line new-cap

/* // doesn't make sense to get profile if not authenticated

const config = require('../../../config/env');

if(!config.requireAuth) {

  router
  .get("/profile",userCtrl.get)

}
else {
*/

router.route('/profile')
  /**
  * @api {get} /api/profiles  Get Profile
  * @apiName Get Profile
  * @apiGroup Profile
  * @apiPermission signed user
  */
  .get(checkJwt, scopesJwt, userCtrl.get)

export default router;
