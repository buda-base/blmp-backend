import path from 'path';
// Use dotenv to read .env vars into Node
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  root: path.join(__dirname, '/..')
};

export default Object.assign(defaults, config);
