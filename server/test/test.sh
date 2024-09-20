#!/bin/sh

node --no-deprecation $(which mocha) test/codetabs.test.js
node --no-deprecation $(which mocha) test/random.test.js
