var express = require('express');
var router = express.Router();

router.get("/", function(req, res, next) {
    const data = {
        data: {
            msg: "Joakim mikaelsson"
        }
    }

    res.json(data);
})

module.exports = router;