const db = require("../db/database.js");
const hat = require("hat");
const validator = require("email-validator");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let config;

try {
    config = require('../../config/config.json');
} catch (error) {
    console.error(error);
}

const jwtSecret = process.env.JWT_SECRET || config.secret;

const auth = {
    checkAPIKey: function (req, res, next) {
        if ( req.path == '/') {
            return next();
        }

        if ( req.path == '/v2') {
            return next();
        }

        if ( req.path == '/auth/api_key') {
            return next();
        }

        if ( req.path == '/auth/api_key/confirmation') {
            return next();
        }

        if ( req.path == '/auth/api_key/deregister') {
            return next();
        }

        auth.isValidAPIKey(req.query.api_key || req.body.api_key, next, req.path, res);
    },

    isValidAPIKey: function(apiKey, next, path, res) {
        db.get("SELECT email FROM apikeys WHERE key = ?", apiKey, (err, row) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: path,
                        title: "Database error",
                        detail: err.message
                    }
                });
            }

            if (row !== undefined) {
                return next();
            }

            return res.status(401).json({
                errors: {
                    status: 401,
                    source: path,
                    title: "Valid API key",
                    detail: "No valid API key provided."
                }
            });
        });
    },

    getNewAPIKey: function(res, email) {
        let data = {
            apiKey: ""
        };

        if (email === undefined || !validator.validate(email)) {
            data.message = "A valid email address is required to obtain an API key.";
            data.email = email;

            return res.render("api_key/form", data);
        }

        db.get("SELECT email, key FROM apikeys WHERE email = ?", email, (err, row) => {
            if (err) {
                data.message = "Database error: " + err.message;
                data.email = email;

                return res.render("api_key/form", data);
            }

            if (row !== undefined) {
                data.apiKey = row.key;

                return res.render("api_key/confirmation", data);
            }

            return auth.getUniqueAPIKey(res, email);
        });
    },

    getUniqueAPIKey: function(res, email) {
        const apiKey = hat();
        let data = {
            apiKey: ""
        };

        db.get("SELECT key FROM apikeys WHERE key = ?", apiKey, (err, row) => {
            if (err) {
                data.message = "Database error: " + err.message;
                data.email = email;

                return res.render("api_key/form", data);
            }

            if (row === undefined) {
                db.run("INSERT INTO apikeys (key, email) VALUES (?, ?)",
                    apiKey,
                    email, (err) => {
                        if (err) {
                            data.message = "Database error: " + err.message;
                            data.email = email;

                            return res.render("api_key/form", data);
                        }

                        data.apiKey = apiKey;

                        return res.render("api_key/confirmation", data);
                    });
            } else {
                return auth.getUniqueAPIKey(res, email);
            }
        });
    },

    deregister: function(res, body) {
        const email = body.email;
        const apiKey = body.apikey;

        db.get("SELECT key FROM apikeys WHERE key = ? and email = ?",
            apiKey,
            email,
            (err, row) => {
                if (err) {
                    let data = {
                        message: "Database error: " + err.message,
                        email: email,
                        apikey: apiKey
                    };

                    return res.render("api_key/deregister", data);
                }

                if (row === undefined) {
                    let data = {
                        message: "The E-mail and API-key combination does not exist.",
                        email: email,
                        apikey: apiKey
                    };

                    return res.render("api_key/deregister", data);
                }

                return auth.deleteData(res, apiKey, email);
            });
    },

    deleteData: function(res, apiKey, email) {
        let errorMessages = [];

        db.run("DELETE FROM apikeys WHERE key = ?",
            apiKey,
            (err) => {
                if (err) {
                    errorMessages.push(err);
                }

                db.run("DELETE FROM deliveries WHERE apiKey = ?",
                    apiKey,
                    (err) => {
                        if (err) {
                            errorMessages.push(err);
                        }

                        db.run("DELETE FROM invoices WHERE apiKey = ?",
                            apiKey,
                            (err) => {
                                if (err) {
                                    errorMessages.push(err);
                                }

                                db.run("DELETE FROM orders WHERE apiKey = ?",
                                    apiKey,
                                    (err) => {
                                        if (err) {
                                            errorMessages.push(err);
                                        }

                                        db.run("DELETE FROM order_items WHERE apiKey = ?",
                                            apiKey,
                                            (err) => {
                                                if (err) {
                                                    errorMessages.push(err);
                                                }

                                                db.run("DELETE FROM products WHERE apiKey = ?",
                                                    apiKey,
                                                    (err) => {
                                                        if (err) {
                                                            errorMessages.push(err);
                                                        }

                                                        db.run("DELETE FROM users WHERE apiKey = ?",
                                                            apiKey,
                                                            (err) => {
                                                                if (err) {
                                                                    errorMessages.push(err);
                                                                }

                                                                return auth.afterDelete(
                                                                    res,
                                                                    apiKey,
                                                                    email,
                                                                    errorMessages
                                                                );
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    },

    afterDelete: function(res, apiKey, email, errorMessages) {
        if (errorMessages.length > 0) {
            let data = {
                message: "Could not delete data due to: " +
                    errorMessages.join(" | "),
                email: email,
                apikey: apiKey
            };

            return res.render("api_key/deregister", data);
        }

        let data = {
            message: "All data has been deleted",
            email: ""
        };

        return res.render("api_key/form", data);
    },

    login: function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        db.get("SELECT * FROM users WHERE apiKey = ? AND email = ?",
            apiKey,
            email,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "Database error",
                            detail: err.message
                        }
                    });
                }

                if (rows === undefined) {
                    return res.status(401).json({
                        errors: {
                            status: 401,
                            source: "/login",
                            title: "User not found",
                            detail: "User with provided email not found."
                        }
                    });
                }

                const user = rows;

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
                        let payload = { api_key: user.apiKey, email: user.email };
                        let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                        return res.json({
                            data: {
                                type: "success",
                                message: "User logged in",
                                user: payload,
                                token: jwtToken
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
                });
            });
    },

    register: function(res, body) {
        const email = body.email;
        const password = body.password;
        const apiKey = body.api_key;

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

        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            db.run("INSERT INTO users (apiKey, email, password) VALUES (?, ?, ?)",
                apiKey,
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
                        });
                    }

                    return res.status(201).json({
                        data: {
                            message: "User successfully registered."
                        }
                    });
                });
        });
    },

    checkToken: function(req, res, next) {
        var token = req.headers['x-access-token'];

        if (token) {
            jwt.verify(token, jwtSecret, function(err, decoded) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: req.path,
                            title: "Failed authentication",
                            detail: err.message
                        }
                    });
                }

                req.user = {};
                req.user.api_key = decoded.api_key;
                req.user.email = decoded.email;

                next();

                return undefined;
            });
        } else {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: req.path,
                    title: "No token",
                    detail: "No token provided in request headers"
                }
            });
        }
    }
};

module.exports = auth;