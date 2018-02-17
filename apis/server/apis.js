/* */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

require('dotenv').config({ path: __dirname + '/../../_lib/.env' });
const stats = require(__dirname + '/../../_lib/stats.js');
const lib = require(__dirname + '/../../_lib/lib.js');

let port = 3000;
if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT_APIS;
}

const alexa = require('./alexa/alexa.js');
const corsproxy = require('./cors-proxy/proxy.js');
const headers = require('./http-headers/headers.js');
const weather = require('./weather/weather.js');

app.disable('x-powered-by');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(stats.updateStats);

app.use('/alexa', alexa);
app.use('/cors-proxy', corsproxy);
app.use('/http-headers', headers);
app.use('/weather', weather);

app.get('*', function (req, res) {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

app.listen(port, function () {
  const time = new Date().toUTCString().split(',')[1];
  console.log('Express server on port ' + port + ' - ' + time);
  stats.testDB();
});

module.exports = app;
