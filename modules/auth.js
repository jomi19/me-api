const db = require("../db/database.js");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const errors = require("./errors");
const bcrypt = require("bcryptjs");

const auth = {
    /**
     * Function to register a new user
     *
     * @param {*} res
     * @param {*} body
     */
    register: function(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return errors.error(res, 401, "/login", "Email or password missing");
        }
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                return errors.error(res, 500, "/rgister", "Bcrypt error");
            }
            db.run("INSERT INTO users (email, password) values (?, ?)",
                email,
                hash, (err) => {
                    if (err) {
                        return errors.error(res, 500, "register", "Database error", err.message);
                    }

                    return res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });
                }
            );
        });
    },

    login: function(res, body) {
        const email = body.email;
        const password = body.password;
        const jwtpayload = { email: email };
        const secret = process.env.JWT_SECRET;

        if (!email || !password) {
            return errors.error(res, 401, "/login", "Email or password missing");
        }

        db.get("SELECT * FROM users WHERE email = ?",
            email, (err, row) => {
                if (err) {
                    return errors.error(res, 500, "/login", "Database error", err.message);
                }
                if (row === undefined) {
                    return errors.error(res, 401, "/login", "User not found",
                        "User with provided email not found");
                }

                const user = row;

                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return errors.error(res, 500, "/login", "Bcrypt error");
                    }

                    if (result) {
                        const token = jwt.sign(jwtpayload, secret, {expiresIn: "1h"});
                        let payload = { token: token, email: user.email };

                        return res.json({
                            data: {
                                type: "success",
                                message: "User logged in",
                                user: payload,
                            }
                        });
                    }

                    return errors.error(res, 401, "/login", "Wrong password",
                        "Password is incorrect");
                });
            }
        );
    },

    checkToken: function(req, res, next) {
        const token = req.headers['x-access-token'];

        jwt.verify(token, process.env.JWT_SECRET, function(err) {
            if (err) {
                return errors.error(res, 401, "/reports", "Unauthorized");
            }
            next();
        });
    }
};

module.exports = auth;
