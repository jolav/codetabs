/* */

import express from "express";
import { aux, mw, AppError } from "./middlewares.js";
import { config } from "./_config.js";

const weatherRouter = express.Router();
weatherRouter.get("/v1/weather", async function (req, res, next) {
  const city = req.query.city;
  try {
    let data;
    if (city) {
      data = await weather.cityToTemp(city);
    } else {
      data = await weather.getFromGeo(req);
    }
    if (!data) {
      next(new AppError(400, aux.badRequest));
      return;
    }
    mw.sendResult(res, 200, data, false);
  } catch (err) {
    next(err);
  }
});

export {
  weatherRouter,
};

const weather = {
  base: "https://api.weatherapi.com/v1/current.json?key=",
  auxUrl: `http://localhost:${config.portOLD}/v1/geolocation/json?q=`,
  data: {},

  getFromGeo: async function (req) {
    let getCityByIP = this.auxUrl + aux.getIP(req);
    const [data, err] = await aux.fetchData(getCityByIP);
    if (err) {
      throw new AppError(500, `Weather Service Error: ${err.message}`);
    }
    if (data.city !== '') {
      return this.cityToTemp(data.city);
    }
    throw new AppError(500, "Invalid Data Response");
  },
  cityToTemp: async function (city) {
    const url = this.base + config.weather.apiKey1 + "&q=" + city + "&aqi=no";
    const [data, err] = await aux.fetchData(url);
    if (err) {
      throw new AppError(500, `Weather Service Error: ${err.message}`);
    }
    if (!data) {
      throw new AppError(500, "Invalid Data Response");
    }
    this.data = {};
    this.data.city = city;
    this.data.country = data.location.country;
    this.data.lat = data.location.lat.toFixed(4);
    this.data.lon = data.location.lon.toFixed(4);
    this.data.tempC = data.current.temp_c;
    this.data.tempF = data.current.temp_f;
    return this.data;
  },
};