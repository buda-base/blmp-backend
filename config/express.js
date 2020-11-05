import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from 'http-status';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import winstonInstance from './winston';
import routes from '../server/routes/index.route';
import config from './env';

const Log = require('debug-level')

const loggerInstance = new Log('bdrc:server');
const Boom = require('@hapi/boom')

const app = express();

if (config.env === 'development') {
  app.use(logger('dev'));
}

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }));
}

const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9
  const NS_TO_MS = 1e6
  const diff = process.hrtime(start)

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

if (config.env === 'development') {
  app.use((req, res, next) => {
    loggerInstance.log(`${req.method} ${req.originalUrl} [STARTED]`)
    const start = process.hrtime()

    res.on('finish', () => {
      const durationInMilliseconds = getDurationInMilliseconds(start)
      loggerInstance.log(`${req.method} ${req.originalUrl} [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`)
    })

    res.on('close', () => {
      const durationInMilliseconds = getDurationInMilliseconds(start)
      loggerInstance.log(`${req.method} ${req.originalUrl} [CLOSED] ${durationInMilliseconds.toLocaleString()} ms`)
    })

    next()
  })
}

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  bodyParser.json({ limit: '50mb' })(req, res, next);
});

// mount all routes on /api path
app.use('/api', routes);

// if error is not an instanceOf Boom, convert it.
app.use((err, req, res, next) => {
  if (err.name === 'URIError') {
    loggerInstance.error(err.message)
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(Boom.internal(err.message))
  }

  if (err.name === 'UnauthorizedError') {
    loggerInstance.error(err.message)

    let errorMessage = err.message
    if (err.message === 'jwt expired' || err.message === 'No authorization token was found') {
      errorMessage = 'Session expired'
    }

    return res.status(httpStatus.UNAUTHORIZED).json(Boom.unauthorized(errorMessage))
  }

  loggerInstance.error(err);

  if (err instanceof expressValidation.ValidationError) {
    const error = new Boom.Boom(err.message, err.statusCode);
    return next(error);
  // eslint-disable-next-line no-else-return
  } else if (!Boom.isBoom(err)) {
    const apiError = new Boom.Boom(err.message, { errorCode: err.status || 502 });
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res) => {
  loggerInstance.error('API not found');
  return res.status(httpStatus.NOT_FOUND).json(Boom.notFound('API not found'))
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance
  }));
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  loggerInstance.error('Something went wrong:', err.output);

  return res.status(500).json({
    message: err.message,
    stack: config.env === 'development' ? err.stack : {}
  })
});

export default app;
