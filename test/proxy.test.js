/* */

import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

import { aux } from "../middlewares.js";
const url = "http://localhost:3000";

describe('CORS-PROXY TEST ', function () {
  before(function (done) {
    done();
  });
  it('json api', function (done) {
    // disable timeout https://github.com/mochajs/mocha/issues/2025 
    this.timeout(0);
    chai.request.execute(url)
      .get('/v1/proxy?quest=apis-v1-jolav.glitch.me/time/')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('unix');
        expect(res.body).to.have.property('natural');
        done();
      });
  });
  it('json api', function (done) {
    chai.request.execute(url)
      .get('/v1/proxy?quest=api.codetabs.com/v1/geolocation/json')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        done();
      });
  });
  it('json api www', function (done) {
    chai.request.execute(url)
      .get('/v1/proxy?quest=www.api.codetabs.com/v1/geolocation/json')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        done();
      });
  });
  it('json api http', function (done) {
    chai.request.execute(url)
      .get('/v1/proxy?quest=http://www.api.codetabs.com/v1/geolocation/json')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        done();
      });
  });
  it('image', function (done) {
    chai.request.execute(url)
      .get('/v1/proxy?quest=jolav.github.io/_public/icons/jolav128.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('image https', function (done) {
    chai.request.execute(url)
      .get('/v1/proxy?quest=https://jolav.github.io/sprite.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('image http', function (done) {
    chai.request.execute(url)
      .get('/v1/proxy?quest=http://jolav.github.io/sprite.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('non existent domain ENOTFOUND', function (done) {
    const t = "Invalid URI -> i-do-not-exist-as-domain";
    chai.request.execute(url)
      .get('/v1/proxy?quest=i-do-not-exist-as-domain')
      .query({})
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
  it('invalid URI 1 ENOTFOUND', function (done) {
    const t = "Invalid URI -> https:/code%%tabs.com";
    chai.request.execute(url)
      .get('/v1/proxy?quest=https:/code%%tabs.com')
      .query({})
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
  it('invalid URI 2 ENOTFOUND', function (done) {
    const t = "Invalid URI -> https:/codetabs.com";
    chai.request.execute(url)
      .get('/v1/proxy?quest=https:/codetabs.com')
      .query({})
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
  it('invalid URI 3 ENOTFOUND', function (done) {
    const t = "Invalid URI -> https:/code%%tabs.com";
    chai.request.execute(url)
      .get('/v1/proxy?quest=https:/code%%tabs.com')
      .query({})
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
  it('invalid URI 4 ENOTFOUND', function (done) {
    const t = "Invalid URI -> https://code%%tabs.com";
    chai.request.execute(url)
      .get('/v1/proxy?quest=https://code%%tabs.com')
      .query({})
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
  it('invalid URI 5 ENOTFOUND', function (done) {
    const t = "Invalid URI -> /https://codetabs.com";
    chai.request.execute(url)
      .get('/v1/proxy?quest=/https://codetabs.com')
      .query({})
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
  it('Invalid Uri 6 ETIMEDOUT', function (done) {
    const t = "Invalid URI -> https://github.com:3000";
    // disable timeout https://github.com/mochajs/mocha/issues/2025 
    this.timeout(0);
    chai.request.execute(url)
      .get('/v1/proxy?quest=https://github.com:3000')
      .query({})
      .end(function (err, res) {
        //console.log('PATH=> ', res.req.path);
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });
});
