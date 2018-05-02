/* */

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiXml = require('chai-xml');

const expect = require('chai').expect;

chai.use(chaiHttp);
chai.use(chaiXml);

const url = 'https://api.codetabs.com';
// const url = 'http://localhost:3000'

describe('CORS-PROXY TEST ', function () {
  before(function (done) {
    done();
  });
  it('json api', function (done) {
    chai.request(url)
      .get('/cors-proxy/apis-v1-jolav.glitch.me/time/')
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
  it('image', function (done) {
    chai.request(url)
      .get('/cors-proxy/' + text)
      .query({})
      .end(function (err, res) {
        // console.log('PATH=> ', res.req.path)
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
});

const text = 'http://cdn.glitch.com/c160c73d-cd9a-4c2f-aeb3-c01f00805b6c%2Fjolav128.png?1524902823082';
