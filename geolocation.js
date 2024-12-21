/* */

import express from "express";
import { mw, aux, AppError } from "./middlewares.js";
import { lookup } from "node:dns";

const loadIP2Location = async function () {
  const { IP2Location } = await import('ip2location-nodejs');
  return IP2Location;
};

const geolocationRouter = express.Router();
//GET https://api.codetabs.com/v1/geolocation/json?q=ip4|ip6|hostname 
geolocationRouter.get('/v1/geolocation/json', async function (req, res, next) {
  try {
    const [response, err] = await geolocation.geoData(req, res, next);
    if (err) {
      next(err);
      return;
    }
    mw.sendResult(res, 200, response, false);
  } catch (err) {
    next(err);
  }
});

export {
  geolocationRouter,
};

const geolocation = {
  data: {
    'ip': '',
    'country_code': '',
    'country_name': '',
    'region_name': '',
    'city': '',
    'zip_code': '',
    'time_zone': '',
    'latitude': '',
    'longitude': ''
  },
  clean: function () {
    this.data = {
      'ip': '',
      'country_code': '',
      'country_name': '',
      'region_name': '',
      'city': '',
      'zip_code': '',
      'time_zone': '',
      'latitude': '',
      'longitude': ''
    };
  },
  fromDB: async function (q) {
    //console.log('Searching ....', q);
    const IP2Location = await loadIP2Location();
    const ip2location = new IP2Location();
    ip2location.open("./data/geoDB.bin");
    const data = ip2location.getAll(q);
    ip2location.close();//Async(); // 500 error
    this.clean();
    this.data.ip = q;
    this.data.country_code = data.countryShort;
    this.data.country_name = data.countryLong;
    this.data.region_name = data.region;
    this.data.city = data.city;
    this.data.zip_code = data.zipCode;
    this.data.time_zone = data.timeZone;
    this.data.latitude = parseFloat(data.latitude).toFixed(4);
    this.data.longitude = parseFloat(data.longitude).toFixed(4);
  },
  geoData: async function (req, res) {
    this.clean();
    let q = req.query.q;
    if (!q) {
      q = aux.getIP(req);
    }
    if (aux.isValidIP(q)) {
      try {
        await this.fromDB(q);
        return [this.data, null];
      } catch (err) {
        return [null, new Error(err)];
      }
    }
    if (!aux.isValidHostname(q)) {
      let text = `${q} is a unknown host, not a valid IP or hostname`;
      throw new AppError(400, text);
    }
    try {
      const ip = await this.lookupAsync(q);
      await this.fromDB(ip);
      return [this.data, null];
    } catch (err) {
      let text = `${q} is a unknown host, not a valid IP or hostname`;
      throw new AppError(400, text);
    }
  },
  lookupAsync: function (hostname) {
    return new Promise(function (resolve, reject) {
      lookup(hostname, function (err, ip) {
        if (err || ip === null || ip === undefined) {
          return reject(err);
        }
        resolve(ip);
      });
    });
  }
};
