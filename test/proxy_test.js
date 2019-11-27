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

describe('CORS-PROXY TEST ', function () {
  before(function (done) {
    done();
  });
  it('json api', function (done) {
    // disable timeout https://github.com/mochajs/mocha/issues/2025 
    this.timeout(0);
    chai.request(url)
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
    chai.request(url)
      .get('/v1/proxy?quest=geoip.xyz/v1/json')
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
    chai.request(url)
      .get('/v1/proxy?quest=www.geoip.xyz/v1/json')
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
    chai.request(url)
      .get('/v1/proxy?quest=http://www.geoip.xyz/v1/json')
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
  it('xml api', function (done) {
    chai.request(url)
      .get('/v1/proxy?quest=https://geoip.xyz/v1/xml')
      .query({})
      .end(function (err, res) {
        //console.log('PATH=> ', res.req.path);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        //expect(res.text).xml.to.be.valid();
        done();
      });
  });
  it('image', function (done) {
    chai.request(url)
      .get('/v1/proxy?quest=jolav.me/_public/icons/jolav128.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('image https www', function (done) {
    chai.request(url)
      .get('/v1/proxy?quest=https://www.jolav.me/_public/icons/jolav128.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('image http www', function (done) {
    chai.request(url)
      .get('/v1/proxy?quest=http://www.jolav.me/_public/icons/jolav128.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('image https', function (done) {
    chai.request(url)
      .get('/v1/proxy?quest=https://jolav.me/_public/icons/jolav128.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('image http', function (done) {
    chai.request(url)
      .get('/v1/proxy?quest=http://jolav.me/_public/icons/jolav128.png')
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
  it('non existent domain', function (done) {
    const t = "Invalid URI -> i-do-not-exist-as-domain";
    chai.request(url)
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
  it('invalid URI 1', function (done) {
    const t = "Invalid URI -> https:/code%%tabs.com";
    chai.request(url)
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
  it('invalid URI 2', function (done) {
    const t = "Invalid URI -> https:/codetabs.com";
    chai.request(url)
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
  it('invalid URI 3', function (done) {
    const t = "Invalid URI -> https:/code%%tabs.com";
    chai.request(url)
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
  it('invalid URI 4', function (done) {
    const t = "Invalid URI -> https://code%%tabs.com";
    chai.request(url)
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
  it('invalid URI 5', function (done) {
    const t = "Invalid URI -> /https://codetabs.com";
    chai.request(url)
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
  it('invalid URI 6', function (done) {
    const t = "Invalid URI -> https://codetabs.com:3000";
    // disable timeout https://github.com/mochajs/mocha/issues/2025 
    this.timeout(0);
    chai.request(url)
      .get('/v1/proxy?quest=https://codetabs.com:3000')
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

