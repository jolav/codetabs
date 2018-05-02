/* */

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiXml = require('chai-xml');

const expect = require('chai').expect;

chai.use(chaiHttp);
chai.use(chaiXml);

const url = 'https://api.codetabs.com';
// const url = 'http://localhost:3000'

describe('WEATHER TEST ', function () {
  before(function (done) {
    done();
  });
  if (url !== 'http://localhost:3000') {
    it('local temp // fails on localhost', function (done) {
      chai.request(url)
        .get('/weather/temp')
        .query({})
        .end(function (err, res) {
          // console.log('PATH=> ', res.req.path)
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property('city');
          expect(res.body).to.have.property('country');
          expect(res.body).to.have.property('tempC');
          expect(res.body).to.have.property('tempF');
          done();
        });
    });
  }
  if (url === 'http://localhost:3000') {
    it('empty city', function (done) {
      chai.request(url)
        .get('/weather/temp?city=')
        .query({})
        .end(function (err, res) {
          // console.log('PATH=> ', res.req.path)
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          done();
        });
    });
  } else {
    it('local temp', function (done) {
      chai.request(url)
        .get('/weather/temp')
        .query({})
        .end(function (err, res) {
          // console.log('PATH=> ', res.req.path)
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property('city');
          expect(res.body).to.have.property('country');
          expect(res.body).to.have.property('tempC');
          expect(res.body).to.have.property('tempF');
          done();
        });
    });
  }
  it('inexistent city', function (done) {
    chai.request(url)
      .get('/weather/temp?city=inexistentcity')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(404);
        expect(res.body).to.be.equal('Error 404');

        done();
      });
  });
  it('london city ', function (done) {
    chai.request(url)
      .get('/weather/temp?city=london')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.property('city');
        expect(res.body).to.have.property('country');
        expect(res.body).to.have.property('tempC');
        expect(res.body).to.have.property('tempF');
        done();
      });
  });
  it('new york city', function (done) {
    chai.request(url)
      .get('/weather/temp?city=new york')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.property('city');
        expect(res.body).to.have.property('country');
        expect(res.body).to.have.property('tempC');
        expect(res.body).to.have.property('tempF');
        done();
      });
  });
});
