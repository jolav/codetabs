/* */
import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

import { aux } from "../middlewares.js";
const url = "http://localhost:3000";

describe('CODETABS TEST ', function () {
  before(function (done) {
    done();
  });

  it('empty', function (done) {
    const t = aux.badRequest;//"Bad request :  ??";
    chai
      .request.execute(url)
      .get('')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });

  it('only version', function (done) {
    const t = aux.badRequest;//"Bad request : Service undefined doesnt exists";
    chai
      .request.execute(url)
      .get('/v1')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });

  it('only service', function (done) {
    const t = aux.badRequest;//"Bad request : proxy ??";
    chai
      .request.execute(url)
      .get('/proxy/')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });

  it('bad version', function (done) {
    const t = aux.badRequest;//"Bad request : v2 ??";
    chai
      .request.execute(url)
      .get('/v2/proxy')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });

  it('bad service', function (done) {
    const t = aux.badRequest;//"Bad request : Service badservice doesnt exists";
    chai
      .request.execute(url)
      .get('/v1/badservice')
      .end(function (err, res) {
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
    chai
      .request.execute(url)
      .get('/v1/&(%/&%%/')
      .end(function (err, res) {
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
    chai
      .request.execute(url)
      .get('/&(%/&%%/')
      .end(function (err, res) {
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
    chai
      .request.execute(url)
      .get('')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('Error', t);
        done();
      });
  });*/
});
