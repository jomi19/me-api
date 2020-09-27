process.env.NODE_env = "test";
process.env.JWT_SECRET = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app.js");
const jwt = require("jsonwebtoken");
const token = jwt.sign({email: "chai@test.nu"}, process.env.JWT_SECRET, {expiresIn: "1h"});

chai.should();
chai.use(chaiHttp);

describe("Test report routes", () => {
    var tests = [
        {kmom: "1", status: 200, text: "Test kmom01", error: undefined},
        {kmom: "2", status: 404, text: undefined,  error: "Kmom not found"},
        {kmom: "", status: 404, text: undefined, error: "No kmom selected"}
    ];

    tests.forEach((test) => {
        describe(`GET /reports/week/${test.kmom}`, () => {
            it(`Testing kmom ${test.kmom}`, (done) => {
                chai.request(server)
                    .get(`/reports/week/${test.kmom || ""}`)
                    .end((err, res) => {
                        res.should.have.status(test.status);
                        if (res.body.errors != undefined) {
                            res.body.errors.title.should.equal(test.error);
                        } else {
                            res.body.data.kmom.should.equal(test.kmom);
                            res.body.data.text.should.equal(test.text);
                        }
                        done();
                    });
            });
        });
    });

    var inserts = [
        {kmom: "5", text: "hejhejhej", apikey: token, status: 201},
        {kmom: "", text: "", apikey: token, status: 404},
        {kmom: "5", text: "qwe", apikey: "felapi", status: 401}

    ];

    inserts.forEach((test) => {
        describe(`POST /reports`, () => {
            chai.request(server)
                .post(`/reports`)
                .type(`form`)
                .set({
                    "x-access-token": test.apikey
                })
                .send( {
                    "kmom": test.kmom,
                    "text": test.text
                })
                .end((err, res) => {
                    res.status.should.equal(test.status);
                });
        });
    });

    var edits = [
        {kmom: "3", text: "edit", apikey: token, status: 204},
        {kmom: "", text: "test", apikey: token, status: 404},
        {kmom: "3", text: "test", apikey: "felapi", status: 401}
    ];

    edits.forEach((test) => {
        describe(`PUT /reports`, () => {
            chai.request(server)
                .put(`/reports`)
                .set({
                    "x-access-token": test.apikey
                })
                .send({
                    kmom: test.kmom,
                    text: test.text
                })
                .end((err, res) => {
                    res.status.should.equal(test.status);
                });
        });
    });
});
