/* */

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiXml = require('chai-xml');

const expect = require('chai').expect;

chai.use(chaiHttp);
chai.use(chaiXml);

const path = require('path');
const c = require(path.join(__dirname, '../_config.js'));

let url = c.app.realURL;
if (c.app.mode === "dev") {
  url = c.app.localURL;
}

describe('HEADERS TEST ', function () {
  before(function (done) {
    done();
  });
  it('not domain (empty)', function (done) {
    chai.request(url)
      .get('/v1/headers/get/')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', 'Domain is empty');
        done();
      });
  });
  it('not registered valid domain name', function (done) {
    const t1 = 'Domain is empty';
    chai.request(url)
      .get('/v1/headers/get/sure-this-is-not-registered.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t1);
        done();
      });
  });
  it('not a valid url', function (done) {
    const t2 = 'Bad request : /v1/headers/get/code%%tabs.com is not a valid url';
    chai.request(url)
      .get('/v1/headers/get/code%%tabs.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t2);
        done();
      });
  });
  it('not a valid domain name', function (done) {
    const t2 = 'curl: (6) Could not resolve host: code%%tabs.com';
    chai.request(url)
      .get('/v1/headers?domain=code%%tabs.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t2);
        done();
      });
  });
  it('domain without redirection 1', function (done) {
    chai.request(url)
      .get('/v1/headers?domain=https://codetabs.com')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(1);
        done();
      });
  });
  it('domain without redirection 1', function (done) {
    chai.request(url)
      .get('/v1/headers?domain=http://jolav.me')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(2);
        done();
      });
  });
  it('domain with redirection 1', function (done) {
    chai.request(url)
      .get('/v1/headers?domain=www.codetabs.com')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(3);
        done();
      });
  });
  it('domain with redirection 2', function (done) {
    chai.request(url)
      .get('/v1/headers?domain=www.jolav.me')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(3);
        done();
      });
  });
});
