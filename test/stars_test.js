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

describe('GITHUB STAR HISTORY', function () {
  before(function (done) {
    done();
  });
  it('empty', function (done) {
    const t1 = "Repo is empty";
    chai.request(url)
      .get('/v1/stars?repo=')
      .query({})
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
  it('non existent repo', function (done) {
    const t1 = "jolav/doesnt-exist doesn't exist";
    chai.request(url)
      .get('/v1/stars?repo=jolav/doesnt-exist')
      .query({})
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
  it('empty user', function (done) {
    const t1 = "Incorrect user/repo";
    chai.request(url)
      .get('/v1/stars?repo=/reponame')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.have.property('Error', t1);
        done();
      });
  });
  it('empty repo', function (done) {
    const t1 = "Incorrect user/repo";
    chai.request(url)
      .get('/v1/stars?repo=jolav/')
      .query({})
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
  it('normal repo geoip-xyz', function (done) {
    chai.request(url)
      .get('/v1/stars?repo=jolav/geoip-xyz')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        done();
      });
  });
  it('normal repo nginx/nginx', function (done) {
    chai.request(url)
      .get('/v1/stars?repo=nginx/nginx')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        done();
      });
  });
  /*
  it('upload repo', function (done) {
    chai.request(url)
      .get('/v1/loc/upload/')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        done();
      });
  });*/
});