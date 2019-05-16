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

describe('CODETABS TEST ', function () {
  before(function (done) {
    done();
  });
  it('empty', function (done) {
    const t = "Bad request :  ??";
    chai.request(url)
      .get('')
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
  it('only version', function (done) {
    const t = "Bad request : Service undefined doesnt exists";
    chai.request(url)
      .get('/v1')
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
  it('only service', function (done) {
    const t = "Bad request : proxy ??";
    chai.request(url)
      .get('/proxy/')
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
  it('bad version', function (done) {
    const t = "Bad request : v2 ??";
    chai.request(url)
      .get('/v2/proxy')
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
  it('bad service', function (done) {
    const t = "Bad request : Service badservice doesnt exists";
    chai.request(url)
      .get('/v1/badservice')
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
  it('not valid url 1', function (done) {
    const t = "Bad request : /v1/&(%/&%%/ is not a valid url";
    chai.request(url)
      .get('/v1/&(%/&%%/')
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
  it('not valid url 2', function (done) {
    const t = "Bad request : /&(%/&%%/ is not a valid url";
    chai.request(url)
      .get('/&(%/&%%/')
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
  /*it('', function (done) {
    const t = "";
    chai.request(url)
      .get('')
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });*/
});
