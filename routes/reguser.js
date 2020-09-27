const express = require('express');
const router = express.Router();
const auth = require("./../modules/auth");

router.post("/", function(req, res) {
    auth.register(res, req.body);
});

module.exports = router;
