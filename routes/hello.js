var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
    const data = {
        data: {
            msg: "Joakim Mikaelsson"
        }
    };

    res.status(201).json(data);
});

module.exports = router;
