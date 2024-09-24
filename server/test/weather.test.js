/* */

import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

const url = "http://localhost:3000";

describe('WEATHER TEST ', function () {
  before(function (done) {
    done();
  });
  if (url !== 'http://localhost:3000') {
    it('local temp // fails on localhost', function (done) {
      chai.request.execute(url)
        .get('/v1/weather')
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
      chai.request.execute(url)
        .get('/v1/weather?city=')
        .query({})
        .end(function (err, res) {
          // console.log('PATH=> ', res.req.path)
          expect(err).to.be.null;
          expect(res).to.have.status(500);
          done();
        });
    });
  } else {
    it('local temp', function (done) {
      chai.request.execute(url)
        .get('/weather')
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
  it('unavailable city', function (done) {
    const t2 = "Weather Service Error: HTTP Error: 400 Bad Request";
    chai.request.execute(url)
      .get('/v1/weather?city=unavailablecity')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        expect(res.body).to.have.property('msg', t2);
        done();
      });
  });
  it('london city ', function (done) {
    chai.request.execute(url)
      .get('/v1/weather?city=london')
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
    chai.request.execute(url)
      .get('/v1/weather?city=new york')
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
