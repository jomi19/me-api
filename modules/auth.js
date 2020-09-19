const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/texts.sqlite")
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const errors = require("./errors");
const bcrypt = require("bcryptjs");


const auth = {
    register: function(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/Registrer",
                        title: "Bcrypt error",
                        detail: "Bcrypt error"
                    }
                })
            }
            db.run("INSERT INTO users (email, password) values (?, ?)",
                email,
                hash, (err) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/register",
                                title: "Database error",
                                detail: err.message
                            }
                        })
                    }
                    return res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });
                }
            )
        });
    },

    login: function(res, body) {
        const email = body.email;
        const password = body.password;
        const jwtpayload = { email: email }
        const secret = process.env.JWT_SECRET;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        };

        db.get("SELECT * FROM users WHERE email = ?",
            email, (err, row) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "Database error",
                            detail: err.message
                        }
                    })
                }

                if (row == undefined) {
                    return res.status(401).json({
                        status: 401,
                        source: "/login",
                        title: "User not found",
                        detail: "User with provided email not found."
                    })
                }

                const user = row;

                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            errors: {
                                status: 500,
                                source: "/login",
                                title: "bcrypt error",
                                detail: "bcrypt error"
                            }
                        });
                    }

                    if (result) {
                        const token = jwt.sign(jwtpayload, secret, {expiresIn: "1h"})
                        let payload = { token: token, email: user.email };

                        res.cookie(`token`, token, {httpOnly: true})

                        return res.json({
                            data: {
                                type: "success",
                                message: "User logged in",
                                user: payload,
                            }
                        });
                    }

                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/login",
                            title: "Wrong password",
                            detail: "Password is incorrect."
                        }
                    });
                })

            }
        )

    },

    checkToken: function(req, res, next) {
        const token = req.headers['x-access-token'];
        console.log(req.headers['x-access-token'])
        
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) {
                console.log("in error")
                return errors.error(res, 401, "/reports", "Unauthorized");
            }
            next();
        });

    }
}

module.exports = auth;