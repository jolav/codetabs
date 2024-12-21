/* */

const os = require("os");
const cpus = os.cpus().length;

module.exports = {
  apps: [{
    name: "codetabs",
    script: 'codetabs.js',
    env: {
      NODE_ENV: "production",
    },
    ignore_watch: [
      "node_modules",
    ],
    instances: cpus - 1,
    max_memory_restart: "1500M",
    output: `/home/${process.env.USER}/.mylogs/out.log`,
    error: `/home/${process.env.USER}/.mylogs/error.log`,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
