var sqlite3 = require("sqlite3").verbose();
module.exports = (function () {
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === "test") {
        
        console.log("testdb")
        return new sqlite3.Database("./db/test.sqlite");
    }
    console.log("vanliga db")
    return new sqlite3.Database("./db/texts.sqlite");
}());
