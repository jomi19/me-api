process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app.js");

chai.should();
chai.use(chaiHttp);

describe("Test user functions", () => {
    var users = [
        {email: "", password: "", status: 401, message: "Email or password missing"},
        {email: "mailen@not.exists", password: "whoami", status: 401, message: "User not found"},
        {email: "chai@test.nu", password: "testar", status: undefined,  message: "User logged in"},
        {email: "chai@test.nu", password: "wrongpass", status: 401, message: "Wrong password"}
    ];

    users.forEach((test) => {
        describe(`POST /login`, () => {
            it(`Loging in with ${test.message}`, (done) => {
                chai.request(server)
                    .post(`/login`)
                    .send({
                        email: test.email,
                        password: test.password
                    })
                    .end((err, res) => {
                        if (test.status !== undefined) {
                            res.body.errors.title.should.equal(test.message);
                            res.should.have.status(test.status);
                        } else {
                            res.body.data.user.token.should.be.a("string");
                            res.body.data.message.should.equal(test.message);
                        }

                        done();
                    });
            });
        });
    });

    var newUsers = [
        {user: "my@new.us", password: "pas", status: 201, message: "User successfully registered."},
        {user: "", password: "", status: 401, message: "Email or password missing"},
        {user: "chai@test.nu", password: "testar", status: 500, message: "Database error"}
    ];

    newUsers.forEach((test) => {
        describe(`POST /register`, () => {
            it(`Register user with ${test.message}`, (done) => {
                chai.request(server)
                    .post("/register")
                    .send({
                        email: test.user,
                        password: test.password
                    })
                    .end((err, res) => {
                        console.log(res.body.errors);
                        res.should.have.status(test.status);
                        if (test.status != 201) {
                            res.body.errors.title.should.equal(test.message);
                        } else {
                            res.body.data.message.should.equal(test.message);
                        }
                        done();
                    });
            });
        });
    });
});
