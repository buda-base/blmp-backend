import mongoose from 'mongoose';
import util from 'util';
import config from './config/env';
import app from './config/express';

const Log = require('debug-level')

const debugServer = new Log('bdrc:server');
const debugMongoDB = new Log('bdrc:mongodb');
const instance = process.env.NODE_APP_INSTANCE || 0

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true, // https://mongoosejs.com/docs/deprecations.html
  useCreateIndex: true,
  useFindAndModify: false,
  // autoIndex: false, // Don't build indexes
  poolSize: 6, // Maintain up to 6 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  keepAlive: true,
  keepAliveInitialDelay: 300000
};

mongoose.connect(config.db, dbOptions);

mongoose.connection.on('connected', () => {
  debugMongoDB.info('Mongoose default connection is open to ', config.db);
});

mongoose.connection.on('error', (err) => {
  debugMongoDB.info(`Mongoose default connection error has occurred ${err} error`);
  throw new Error(`unable to connect to database: ${config.db}`);
});

mongoose.connection.on('disconnected', () => {
  debugMongoDB.info('Mongoose default connection is disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    debugMongoDB.info('Mongoose default connection is disconnected due to application termination');
    process.exit(0);
  });
});

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debugMongoDB.info(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    debugServer.info(`server started on port ${config.port} (${config.env})`);
    debugServer.info(`NODE_APP_INSTANCE (${instance})`);
  });
}

export default app;
