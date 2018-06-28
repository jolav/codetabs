/* */

const request = require('request');

const lib = require(__dirname + '/../../_lib/lib.js');

function corsProxy (req, res) {
  let url = req.params[0];

  if (url.slice(0, 5) === 'https') {
    url = url.slice(7, url.length);
  } else if (url.slice(0, 4) === 'http') {
    url = url.slice(6, url.length);
  } else {
    url = 'http://' + url;
  }
  if (!lib.isValidURL(url)) {
    url = 'http:/' + url;
  }
  const x = request(url);
  x.on('error', function (err) {
    res.end();
    return;
  });
  req.pipe(x, {
    end: true
  });
  x.pipe(res);
}

module.exports = {
  corsProxy: corsProxy
};
