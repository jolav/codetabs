/* */

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiXml = require('chai-xml');

const expect = require('chai').expect;

chai.use(chaiHttp);
chai.use(chaiXml);

const url = 'https://api.codetabs.com';
// const url = 'http://localhost:3000'

describe('HTTP-HEADERS TEST ', function () {
  before(function (done) {
    done();
  });
  it('not domain (empty)', function (done) {
    chai.request(url)
      .get('/http-headers/get/')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error', 'url: no URL specified!');
        done();
      });
  });

  it('not registered valid domain name', function (done) {
    const text1 = 'Could not resolve host: sure-this-is-not-registered.com';
    chai.request(url)
      .get('/http-headers/get/sure-this-is-not-registered.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error', text1);
        done();
      });
  });
  it('not a valid domain name', function (done) {
    chai.request(url)
      .get('/http-headers/get/code%%tabs.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        // expect(res).to.be.json
        // expect(res.body).to.be.an('object')
        // expect(res.body).to.have.property('error', 'not a valid domain name')
        done();
      });
  });
  it('domain without redirection', function (done) {
    chai.request(url)
      .get('/http-headers/get/https://codetabs.com')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(1);
        done();
      });
  });
  it('domain with redirection', function (done) {
    chai.request(url)
      .get('/http-headers/get/www.codetabs.com')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(3);
        done();
      });
  });
});
