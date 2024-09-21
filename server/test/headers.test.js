/* */

import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

const url = "http://localhost:3000";

describe('HEADERS TEST ', function () {
  before(function (done) {
    done();
  });
  it('not domain (empty)', function (done) {
    chai.request.execute(url)
      .get('/v1/headers')
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
  it('not domain (empty)', function (done) {
    chai.request.execute(url)
      .get('/v1/headers?domain=')
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
    const t1 = 'Execution failed: curl: (6) Could not resolve host: sure-this-is-not-registered.com';
    chai.request.execute(url)
      .get('/v1/headers?domain=sure-this-is-not-registered.com')
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
    chai.request.execute(url)
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
  it('Unavailable', function (done) {
    const t2 = 'Execution failed: curl: (22) The requested URL returned error: 503';
    chai.request.execute(url)
      .get('/v1/headers?domain=www.amazon.com')
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
    const t2 = `Execution failed: curl: (6) Could not resolve host: code%25%25tabs.com`;
    chai.request.execute(url)
      .get('/v1/headers?domain=code%25%25tabs.com')
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
  it('domain without redirection 1', function (done) {
    chai.request.execute(url)
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
    chai.request.execute(url)
      .get('/v1/headers?domain=http://jolav.github.io')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(2);
        done();
      });
  });
  it('domain with redirection 1', function (done) {
    chai.request.execute(url)
      .get('/v1/headers?domain=www.codetabs.com')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(2);
        done();
      });
  });
  it('domain with redirection 2', function (done) {
    chai.request.execute(url)
      .get('/v1/headers?domain=www.github.com')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array').to.have.lengthOf(3);
        done();
      });
  });
});
