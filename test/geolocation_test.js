/* */

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiXml = require('chai-xml');

const expect = require('chai').expect;

chai.use(chaiHttp);
chai.use(chaiXml);

let url = 'http://localhost:3000/v1/geolocation';

const path = require('path');
const c = require(path.join(__dirname, '/../_config.js'));

if (c.app.mode === 'production') {
  url = 'https://api.codetabs.com.xyz/v1/geolocation';
}

describe('GEOLOCATION TEST JSON', function () {
  before(function (done) {
    done();
  });
  it('JSON /json no parameters', function (done) {
    chai.request(url)
      .get('/json')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip');
        expect(res.body).to.have.property('country_code');
        expect(res.body).to.have.property('country_name');
        expect(res.body).to.have.property('region_code');
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
    chai.request(url)
      .get('/json')
      .query({ q: '208.67.222.222' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip', '208.67.222.222');
        expect(res.body).to.have.property('country_code', 'US');
        expect(res.body).to.have.property('country_name', 'United States');
        expect(res.body).to.have.property('region_code', '');
        expect(res.body).to.have.property('region_name', '');
        expect(res.body).to.have.property('city', '');
        expect(res.body).to.have.property('zip_code', '');
        expect(res.body).to.have.property('time_zone', 'America/Chicago');
        expect(res.body).to.have.property('latitude', '37.7510');
        expect(res.body).to.have.property('longitude', '-97.8220');
        done();
      });
  });
  it('JSON /json?q=8.8.8.8 valid ip', function (done) {
    chai.request(url)
      .get('/json')
      .query({ q: '8.8.8.8' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('ip', '8.8.8.8');
        expect(res.body).to.have.property('country_code', 'US');
        expect(res.body).to.have.property('country_name', 'United States');
        expect(res.body).to.have.property('region_code', '');
        expect(res.body).to.have.property('region_name', '');
        expect(res.body).to.have.property('city', '');
        expect(res.body).to.have.property('zip_code', '');
        expect(res.body).to.have.property('time_zone', 'America/Chicago');
        expect(res.body).to.have.property('latitude', '37.7510');
        expect(res.body).to.have.property('longitude', '-97.8220');
        done();
      });
  });
  it('JSON /json?q=2a00:1450:4006:803::200e valid ipv6', function (done) {
    chai.request(url)
      .get('/json')
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
        expect(res.body).to.have.property('region_code', '');
        expect(res.body).to.have.property('region_name', '');
        expect(res.body).to.have.property('city', '');
        expect(res.body).to.have.property('zip_code', '');
        expect(res.body).to.have.property('time_zone', 'Europe/Dublin');
        expect(res.body).to.have.property('latitude', '53.0000');
        expect(res.body).to.have.property('longitude', '-8.0000');
        done();
      });
  });
  it('JSON /json?q=260.50.50.50  no valid ip', function (done) {
    chai.request(url)
      .get('/json')
      .query({ q: '260.50.50.50' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.equal(text.json[0]);
        done();
      });
  });
  it('JSON /json?q=20.20.-5.20  no valid ip', function (done) {
    chai.request(url)
      .get('/json')
      .query({ q: '20.20.-5.20' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.equal(text.json[1]);
        done();
      });
  });
  it('JSON /json?q=github.com valid hostname', function (done) {
    chai.request(url)
      .get('/json')
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
        expect(res.body).to.have.property('country_name', 'United States');
        expect(res.body).to.have.property('region_code', '');
        expect(res.body).to.have.property('region_name', '');
        expect(res.body).to.have.property('city', '');
        expect(res.body).to.have.property('zip_code', '');
        expect(res.body).to.have.property('time_zone', 'America/Chicago');
        expect(res.body).to.have.property('latitude', '37.7510');
        expect(res.body).to.have.property('longitude', '-97.8220');
        done();
      });
  });
  it('JSON /json?q=no-valid.com no valid hostname', function (done) {
    chai.request(url)
      .get('/json')
      .query({ q: 'no-valid.com' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.equal(text.json[2]);
        done();
      });
  });
});

describe('GEOLOCATION TEST XML', function () {
  before(function (done) {
    done();
  });
  it('XML /xml no parameters', function (done) {
    chai.request(url)
      .get('/xml')
      // .query({q: '8.8.8.8'})
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).xml.to.be.valid();
        done();
      });
  });
  it('XML /xml?q=208.67.222.222 valid ip ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: '208.67.222.222' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).xml.to.be.valid();
        expect(res.text).xml.to.equal(text.xml[1]);
        done();
      });
  });
  it('XML /xml?q=8.8.8.8 valid ip ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: '8.8.8.8' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).xml.to.be.valid();
        expect(res.text).xml.to.equal(text.xml[2]);
        done();
      });
  });
  it('XML /xml?q=2a00:1450:4006:803::200e valid ipv6 ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: '2a00:1450:4006:803::200e' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).xml.to.be.valid();
        expect(res.text).xml.to.equal(text.xml[3]);
        done();
      });
  });
  it('XML /xml?q=260.50.50.50 no valid ip ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: '260.50.50.50' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.equal(text.xml[4]);
        done();
      });
  });
  it('XML /xml?q=20.20.-5.20 no valid ip ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: '20.20.-5.20' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.equal(text.xml[5]);
        done();
      });
  });
  it('XML /xml?q=github.com valid hostname ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: 'github.com' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.text).xml.to.be.valid();
        if (res.text.indexOf('140.82.118.4') === -1) {
          expect(res.text).xml.to.equal(text.xml[6]);
        } else {
          expect(res.text).xml.to.equal(text.xml[7]);
        }
        done();
      });
  });

  it('XML /xml?q=no-valid.com ', function (done) {
    chai.request(url)
      .get('/xml')
      .query({ q: 'no-valid.com' })
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.equal(text.xml[8]);
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
  'xml': [
    '',

    '<myGeoData><ip>208.67.222.222</ip><country_code>US</country_code><country_name>United States</country_name><region_code/><region_name/><city/><zip_code/><time_zone>America/Chicago</time_zone><latitude>37.7510</latitude><longitude>-97.8220</longitude></myGeoData>',

    '<myGeoData><ip>8.8.8.8</ip><country_code>US</country_code><country_name>United States</country_name><region_code/><region_name/><city/><zip_code/><time_zone>America/Chicago</time_zone><latitude>37.7510</latitude><longitude>-97.8220</longitude></myGeoData>',

    '<myGeoData><ip>2a00:1450:4006:803::200e</ip><country_code>IE</country_code><country_name>Ireland</country_name><region_code/><region_name/><city/><zip_code/><time_zone>Europe/Dublin</time_zone><latitude>53.0000</latitude><longitude>-8.0000</longitude></myGeoData>',

    '260.50.50.50 is a unknown host, not a valid IP or hostname',

    '20.20.-5.20 is a unknown host, not a valid IP or hostname',

    '<myGeoData><ip>140.82.118.3</ip><country_code>US</country_code><country_name>United States</country_name><region_code/><region_name/><city/><zip_code/><time_zone>America/Chicago</time_zone><latitude>37.7510</latitude><longitude>-97.8220</longitude></myGeoData>',

    '<myGeoData><ip>140.82.118.4</ip><country_code>US</country_code><country_name>United States</country_name><region_code/><region_name/><city/><zip_code/><time_zone>America/Chicago</time_zone><latitude>37.7510</latitude><longitude>-97.8220</longitude></myGeoData>',

    'no-valid.com is a unknown host, not a valid IP or hostname'

  ]
};
