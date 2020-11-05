import express from 'express';
import expressJwt from 'express-jwt';
import authCtrl from './auth.controller';
import config from '../../../config/env';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(expressJwt({ secret: config.jwtSecret, algorithms: ['RS256'] }), authCtrl.getRandomNumber);

export default router;
