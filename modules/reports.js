const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/texts.sqlite")
const errors = require("./errors");
const jwt = require("jsonwebtoken");

const reports = {
    read: function(res, req) {
        const kmom = req;

        if (!kmom) {
            return errors.error(res, 401, "/reports", "No kmom selected");
        }

        db.get("SELECT * FROM kmom WHERE kmom = ?", 
            kmom,
            (err, row) => {
                if (err) {
                    return errors.error(res, 500, "/reports", "Database error", err.message)
                }

                if (row == undefined) {
                    return errors.error(res, 401, "/reports", "Kmom not found", "That kmomnumber couldent be found");
                }

                return res.json({
                    data: {
                        kmom: kmom,
                        text: row.kmomtext
                    }
                })
            }
        )
    },

    write: function(res, body) {
        const kmom = body.kmom
        const text = body.text

        if (!kmom || !text) {
            return errors.error(res, 401, "/reports", "Text or kmom number missing");
        }

        db.run("INSERT INTO kmom (kmom, kmomtext) values (?, ?)", 
            kmom,
            text,
            (err, rows) =>{
                if (err) {
                    return errors.error(res, 500, "/reports", "Database error", err.message)
                }
                return res.status(201).json({
                    data: {
                        message: "Kmom skickat till databasen."
                    }
                });
            }
        )
    },

    edit: function(res, body) {
        const kmom = body.kmom;
        const text = body.text;

        if (!kmom || !text) {
            return errors.error(res, 401, "/reports", "Text or kmom number missing");
        }

        db.run("UPDATE kmom SET kmomtext = ? WHERE kmom =?",
            text,
            kmom,
            (err, rows) => {
                if (err) {
                    return errors.error(res, 500, "/reports", "Database error", err.message)
                }
                return res.status(204).send();
            }
        )



    }

}

module.exports = reports;