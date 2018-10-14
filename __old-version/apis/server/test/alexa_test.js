/* */

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiXml = require('chai-xml');

const expect = require('chai').expect;

chai.use(chaiHttp);
chai.use(chaiXml);

const url = 'https://api.codetabs.com';
// const url = 'http://localhost:3000'

describe('ALEXA TEST ', function () {
  before(function (done) {
    done();
  });
  it('not domain (empty)', function (done) {
    chai.request(url)
      .get('/alexa/get/')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error', 'Domain is empty');
        done();
      });
  });
  it('not a valid domain name', function (done) {
    chai.request(url)
      .get('/alexa/get/code%%tabs.com')
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
  it('domain in query string', function (done) {
    chai.request(url)
      .get('/alexa/get')
      .query({d: 'google.com'})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.rank).to.be.oneOf(['1', '2', '3', '4', '5']);
        expect(res.body).to.have.property('domain', 'google.com');
        expect(res.body).to.have.property('rank');
        done();
      });
  });
  it('domain in route parameters ', function (done) {
    chai.request(url)
      .get('/alexa/get/google.com')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.rank).to.be.oneOf(['1', '2', '3', '4', '5']);
        expect(res.body).to.have.property('domain', 'google.com');
        expect(res.body).to.have.property('rank');
        done();
      });
  });
  it('www.github.com', function (done) {
    chai.request(url)
      .get('/alexa/get/www.github.com')
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
    chai.request(url)
      .get('/alexa/get/github.com')
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
    const text1 = 'not-top-domain.com not in alexa top 1 million';
    chai.request(url)
      .get('/alexa/get/not-top-domain.com')
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
  it('awwwards.com ,www in the middle of the domain', function (done) {
    chai.request(url)
      .get('/alexa/get/awwwards.com')
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
    chai.request(url)
      .get('/alexa/get/progresswww.nl')
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
    chai.request(url)
      .get('/alexa/get/www.gov.uk')
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
    chai.request(url)
      .get('/alexa/get/www.nic.in')
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
    chai.request(url)
      .get('/alexa/get/bih.nic.in')
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
  it('nic.in , multiple results include the name ', function (done) {
    const text2 = 'Multiple results include nic.in .Must be more specific';
    chai.request(url)
      .get('/alexa/get/nic.in')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error', text2);
        done();
      });
  });
});
