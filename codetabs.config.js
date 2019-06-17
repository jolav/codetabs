/*
pm2 start codetabs.config.js --env production
*/

const path = require("path");
const c = require(path.join(__dirname, '_config.js'));

module.exports = {
  apps: [{
    name: 'codetabs',
    script: 'codetabs.js',
    ignore_watch: ["node_modules", "tmp"],
    output: './../logs/hits.log',
    error: './../logs/errors.log',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    instances: c.app.instances,
    max_memory_restart: "1G",
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};

