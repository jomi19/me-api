const express = require('express');
const router = express.Router();

const reports = require("./../modules/reports");
const auth = require("./../modules/auth");


router.get("/week/:kmom", function(req, res) {
    reports.read(res, req.params.kmom);
})

router.post("/",
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => reports.write(res, req.body)
);

router.put("/", 
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => reports.edit(res, req.body)
);

module.exports = router;