const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    })
  ]
});

export default logger;
