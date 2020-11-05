import httpStatus from 'http-status';
import User from '../../models/user.model';

const Log = require('debug-level')
const Boom = require('@hapi/boom')

const debug = new Log('bdrc:profile');

/**
 * Get Profile
 * @returns {User}
 */
function get(req, res) {
  // allow if it matches user session
  debug.info('Invoked by', req.user)

  User.findOne({ email: req.user.email })
    // eslint-disable-next-line consistent-return
    .then((item) => {
      if (!item) {
        debug.warn('User not found: %O', req.query)
        res.status(httpStatus.NOT_FOUND).json(Boom.notFound())
      } else {
        return res.json(item.toObject({ flattenMaps: true }));
      }
    })
}

export default { get };
