export default {
  env: 'development',
  MONGOOSE_DEBUG: true,
  // allow overriding of the properties from the environment, but supplying default value
  db: process.env.MONGO_URL || 'mongodb://localhost/bdrc',
  port: process.env.PORT || 4061,
  SITE_URL: 'http://localhost:3001',
  BUDA_RESOURCE_URL: 'https://purl.bdrc.io',
  AUTH0_AUDIENCE: 'hdaKssN0YX7qbOegq2FuPr5uqWHtPEpp',
  AUTH0_ISSUER: 'https://dev-1oxjqhz9.us.auth0.com/',
  jwtSecret: 'f0061137-422f-42cb-9a17-6460cdf112e2',
  requireAuth: false
};
