/* */

import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

import { aux } from "../middlewares.js";
const url = "http://localhost:3000";

describe('ALEXA TEST ', function () {
  before(function (done) {
    done();
  });
  it('not domain (empty)', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa')
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
  it('not valid parameters', function (done) {
    const t = "Bad request : /v1/alexa/&(%/&%%/ is not a valid url";
    chai.request.execute(url)
      .get('/v1/alexa/&(%/&%%/')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('msg', aux.badRequest);
        done();
      });
  });
  it('not a valid domain name', function (done) {
    const t = 'code%%tabs.com not in alexa top 1 million';
    chai.request.execute(url)
      .get('/v1/alexa?web=code%%tabs.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });
  it('not a registered domain name', function (done) {
    const t = 'sure-this-is-not-registered.non not in alexa top 1 million';
    chai.request.execute(url)
      .get('/v1/alexa?web=sure-this-is-not-registered.non')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });
  it('domain in query string', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa')
      .query({ web: 'google.com' })
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.rank).to.be.oneOf([1, 2, 3, 4, 5]);
        expect(res.body).to.have.property('domain', 'google.com');
        expect(res.body).to.have.property('rank');
        done();
      });
  });
  it('domain in route parameters ', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=google.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.rank).to.be.oneOf([1, 2, 3, 4, 5]);
        expect(res.body).to.have.property('domain', 'google.com');
        expect(res.body).to.have.property('rank');
        done();
      });
  });
  it('www.github.com', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=www.github.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'github.com');
        done();
      });
  });
  it('github.com', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=github.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'github.com');
        done();
      });
  });
  it('valid domain not in alexa top 1m', function (done) {
    const t = 'not-top-domain.com not in alexa top 1 million';
    chai.request.execute(url)
      .get('/v1/alexa?web=not-top-domain.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });
  it('awwwards.com ,www in the middle of the domain', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=awwwards.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'awwwards.com');
        done();
      });
  });
  it('progresswww.nl ,www at the end of the domain', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=progresswww.nl')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'progresswww.nl');
        done();
      });
  });
  it('www.gov.uk ,www as subdomain', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=www.gov.uk')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'www.gov.uk');
        done();
      });
  });
  it('www.nic.in ,www as subdomain', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=www.nic.in')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'www.nic.in');
        done();
      });
  });
  it('bih.nic.in ,not www subdomain in a multiple results', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=bih.nic.in')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'bih.nic.in');
        done();
      });
  });
  it('nic.in , exists with www ', function (done) {
    chai.request.execute(url)
      .get('/v1/alexa?web=nic.in')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('domain', 'www.nic.in');
        done();
      });
  });
  it('params instead query 1', function (done) {
    const t = "Domain is empty";
    chai.request.execute(url)
      .get('/v1/alexa/codetabs.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('msg', aux.badRequest);
        done();
      });
  });
  it('params instead query 2', function (done) {
    const t = "Domain is empty";
    chai.request.execute(url)
      .get('/v1/alexa/get/codetabs.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('msg', aux.badRequest);
        done();
      });
  });
});
