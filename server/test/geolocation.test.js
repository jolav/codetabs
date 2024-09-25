/* */

import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

import { aux } from "../middlewares.js";
const url = "http://localhost:3000";

describe('GEOLOCATION TEST JSON', function () {
  before(function (done) {
    done();
  });
  it('JSON /json no parameters', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip');
        expect(res.body).to.have.property('country_code');
        expect(res.body).to.have.property('country_name');
        expect(res.body).to.have.property('region_name');
        expect(res.body).to.have.property('city');
        expect(res.body).to.have.property('zip_code');
        expect(res.body).to.have.property('time_zone');
        expect(res.body).to.have.property('latitude');
        expect(res.body).to.have.property('longitude');
        done();
      });
  });
  it('JSON /json?q=208.67.222.222 valid ip', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: '208.67.222.222' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip', '208.67.222.222');
        expect(res.body).to.have.property('country_code', 'US');
        expect(res.body).to.have.property('country_name', 'United States of America');
        expect(res.body).to.have.property('region_name', 'California');
        expect(res.body).to.have.property('city', 'San Francisco');
        expect(res.body).to.have.property('zip_code', '94107');
        expect(res.body).to.have.property('time_zone', '-08:00');
        expect(res.body).to.have.property('latitude', '37.7757');
        expect(res.body).to.have.property('longitude', '-122.3952');
        done();
      });
  });
  it('JSON /json?q=8.8.8.8 valid ip', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: '8.8.8.8' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip', '8.8.8.8');
        expect(res.body).to.have.property('country_code', 'US');
        expect(res.body).to.have.property('country_name', 'United States of America');
        expect(res.body).to.have.property('region_name', 'California');
        expect(res.body).to.have.property('city', 'Mountain View');
        expect(res.body).to.have.property('zip_code', '94043');
        expect(res.body).to.have.property('time_zone', '-08:00');
        expect(res.body).to.have.property('latitude', '37.4060');
        expect(res.body).to.have.property('longitude', '-122.0785');
        done();
      });
  });
  it('JSON /json?q=2a00:1450:4006:803::200e valid ipv6', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: '2a00:1450:4006:803::200e' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip', '2a00:1450:4006:803::200e');
        expect(res.body).to.have.property('country_code', 'IE');
        expect(res.body).to.have.property('country_name', 'Ireland');
        expect(res.body).to.have.property('region_name', 'Dublin');
        expect(res.body).to.have.property('city', 'Dublin');
        expect(res.body).to.have.property('zip_code', 'D8');
        expect(res.body).to.have.property('time_zone', '+00:00');
        expect(res.body).to.have.property('latitude', '53.3440');
        expect(res.body).to.have.property('longitude', '-6.2672');
        done();
      });
  });
  it('JSON /json?q=260.50.50.50  no valid ip', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: '260.50.50.50' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.msg).to.equal(text.json[0]);
        done();
      });
  });
  it('JSON /json?q=20.20.-5.20  no valid ip', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: '20.20.-5.20' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.msg).to.equal(text.json[1]);
        done();
      });
  });
  it('JSON /json?q=github.com valid hostname', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: 'github.com' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        // expect(res.body).to.have.property('ip', '192.30.253.112')
        //expect(res.body.ip).to.be.oneOf(['192.30.253.112', '192.30.253.113']);
        expect(res.body).to.have.property('country_code', 'US');
        expect(res.body).to.have.property('country_name', 'United States of America');
        expect(res.body).to.have.property('region_name', 'California');
        expect(res.body).to.have.property('city', 'San Francisco');
        expect(res.body).to.have.property('zip_code', '94107');
        expect(res.body).to.have.property('time_zone', '-08:00');
        expect(res.body).to.have.property('latitude', '37.7757');
        expect(res.body).to.have.property('longitude', '-122.3952');
        done();
      });
  });
  it('JSON /json?q=no-valid.com no valid hostname', function (done) {
    chai.request.execute(url)
      .get('/v1/geolocation/json')
      .query({ q: 'no-valid.com' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.msg).to.equal(text.json[2]);
        done();
      });
  });
});

const text = {
  'json': [
    '260.50.50.50 is a unknown host, not a valid IP or hostname',
    '20.20.-5.20 is a unknown host, not a valid IP or hostname',
    'no-valid.com is a unknown host, not a valid IP or hostname'
  ],
};
