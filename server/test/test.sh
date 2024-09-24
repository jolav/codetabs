#!/bin/sh

node --no-deprecation $(which mocha) test/codetabs.test.js  
node --no-deprecation $(which mocha) test/random.test.js  
node --no-deprecation $(which mocha) test/headers.test.js  
node --no-deprecation $(which mocha) test/weather.test.js  
node --no-deprecation ${which mocha} test/alexa.test.js  
