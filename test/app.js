// process.env.NODE_env = "test";

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const server = require("../app.js");

// chai.should();
// chai.use(chaiHttp);

// describe("Main page", () => {
//     // // FUNGERAR IBLAND ????
//     // describe("GET /", () => {
//     //     it("First page", (done) => {
//     //         chai.request(server)
//     //             .get("/")
//     //             .end((err, res) => {
//     //                 // res.body.should.be.an("object");
//     //                 // res.body.data.should.be.an("object");
//     //                 // res.body.data.msg.should.equal("Joakim Mikaelsson");
//     //                 done();
//     //             });
//     //     });
//     // });

//     describe("GET page dont existrs", () => {
//         it("Page dont exists", (done) => {
//             chai.request(server)
//                 .get("/nogpagehere")
//                 .end((err, res) => {
//                     res.status.should.equal(404);
//                     done();
//                 });
//         });
//     });
// });
