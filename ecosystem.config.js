module.exports = {
  apps: [
    {
      name    : 'bdrc-api',
      script  : 'index.js',
      cwd     : 'dist',
      watch   : false,
      exec_mode  : "cluster",
      instances  : 1,
      error_file: '/usr/local/log/bdrc-api/err.log',
      out_file: '/usr/local/log/bdrc-api/out.log',
      log_file: '/usr/local/log/bdrc-api/combined.log',
      merge_logs: true,
      env     : {
        NODE_ENV: 'development',
        PORT: 4061,
        HTTPS: false,
        DEBUG:'bdrc:*',
        DEBUG_LEVEL:'INFO',
        DEBUG_JSON:0
      },
      env_production : {
        NODE_ENV: 'production',
        PORT: 4061,
        HTTPS: false,
        DEBUG:'bdrc:*',
        DEBUG_LEVEL:'INFO',
        DEBUG_JSON:0,
        DEBUG_COLORS: true
      }
    }
  ]
};
