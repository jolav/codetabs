/* */

import { use, expect } from "chai";
import chaiHttp from "chai-http";
const chai = use(chaiHttp);

import { aux } from "../middlewares.js";

const url = "http://localhost:3000";

describe("RANDOM API TESTS", () => {
  // Test para /v1/random/name
  describe("GET /v1/random/name", () => {
    it("should return a random name", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/name")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("quest", "Random Name");
          expect(res.body.data).to.be.an("array").with.lengthOf(1);
          done();
        });
    });
    it("should return a 404 if only service is ok ", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("msg", "Route Not Found");
          done();
        });
    });
    it("should return a bad request if service is ok but not the rest", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/inte")
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("msg", "Route Not Found");
          done();
        });
    });
  });

  // Test para /v1/random/integer
  describe("GET /v1/random/integer", () => {
    it("should return a random integer within the specified range", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/integer?min=1&max=10")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("quest", "Random Integer between 1-10");
          expect(res.body.data).to.be.an("array").with.lengthOf(1);
          done();
        });
    });

    it("should return multiple random integers when times is provided", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/integer?min=1&max=10&times=5")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("quest", "5 Random Integers between 1-10");
          expect(res.body.data).to.be.an("array").with.lengthOf(5);
          done();
        });
    });

    it("should return bad request if times <1 ", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/integer?min=1&max=10&times=-5")
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should return bad request if min is invalid", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/integer?min=-1&max=10")
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should return bad request if max is less than min", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/integer?min=10&max=1")
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  // Test para /v1/random/list
  describe("GET /v1/random/list", () => {
    it("should return a randomized list of specified length", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/list?len=5")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("quest", "Randomized order list with 5 elements");
          expect(res.body.data).to.be.an("array").with.lengthOf(5);
          done();
        });
    });

    it("should return bad request if list length is too small", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/list?len=1")
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should return bad request if list length is too large", (done) => {
      chai
        .request.execute(url)
        .get("/v1/random/list?len=10001")
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
