"use strict";

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const hello = require("./routes/hello");
const users = require("./routes/users");
const reports = require("./routes/reports");
const port = 1337;
const reguser = require("./routes/reguser");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});
// Logs when its not a test
if (process.env.NODE_ENV !== "test") {
    //Use morang to log
    app.use(morgan("combined"));
}

//Routs
app.use("/", hello);

app.use("/reports", reports);

app.use("/login", users);

app.use("/register", reguser);


// app.put("/user", (req, res) => {
//     // Put returns 204 n content
//     res.status(204).send();
//     console.log(req.body.id)
// });

// app.delete("/user", (req, res) => {
//     // Delete returns 204 with no content
//     res.status(204).send();
// })

// Gives 404 error code if path dont exists
app.use((req, res, next) => {
    var err = new Error("Not found");

    err.status = 404;
    next(err);
});

// app.use((req, res, next) => {
//     if (res.headersSent) {
//         return next(err);
//     }

//     res.status(err.status || 500).json({
//         errors: [
//             {
//                 "status": err.status,
//                 "title": err.message,
//                 "detail": err.message
//             }
//         ]
//     });
// });

const server = app.listen(port, () => {
    console.log(`Listening to ${port}`);
});

module.exports = server;
