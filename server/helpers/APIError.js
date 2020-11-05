import httpStatus from 'http-status';

const Boom = require('@hapi/boom')

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
function APIError(message, status = httpStatus.INTERNAL_SERVER_ERROR) {
  return new Boom(message, { statusCode: status });
}

export default APIError;
