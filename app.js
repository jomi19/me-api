"use strict";

const app = require("express")();
const ioServer = require("http").createServer(app);
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const hello = require("./routes/hello");
const users = require("./routes/users");
const reports = require("./routes/reports");
const port = 1337;
const reguser = require("./routes/reguser");

const io = require("socket.io")(ioServer);
const userSocketIdMap = new Map();
const usersOnline = [];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});


function addUserToOnline(socketId, username) {
    if (!userSocketIdMap.has(username)) {
        userSocketIdMap.set(socketId, username)
        usersOnline.push(username);
    } else {

    }
}

function removeUser(socketId) {
    console.log(socketId)
    if (userSocketIdMap.has(socketId)) {
        let user = userSocketIdMap.get(socketId)

        usersOnline.splice(usersOnline.indexOf(user), 1);
        userSocketIdMap.delete(socketId);
        console.log("ahr" + user)

        console.log(userSocketIdMap)
    }

    io.emit("userList", usersOnline)
}


io.on("connection", function(socket) {
    console.info("User connected");

    socket.on("username", function(username) {
        addUserToOnline(socket.id, username)
        io.emit("chat message", `${username} Dök upp i chatten!`)
        io.emit("userList", usersOnline);
        
    })
    socket.on("chat message", function(message) {
        io.emit("chat message", message)
    })

    socket.on("disconnect", function() {
        console.log("disconnect");
        removeUser(socket.id);
    })
    
})


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

const server = ioServer.listen(port, () => {
    console.log(`Listening to ${port}`);
});


module.exports = server;
