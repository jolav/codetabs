/* */

module.exports = {
  apps: [{
    name: 'codetabs',
    script: 'codetabs.js',
    ignore_watch: ["node_modules", "tmp"],
    output: './../logs/hits.log',
    error: './../logs/errors.log',
    instances: 8,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};