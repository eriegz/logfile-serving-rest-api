const express = require("express");
const router = express.Router();

const config = require("../config");

router.get("/version", (req, res) => {
  res.send({
    version: config.VERSION
  });
});

module.exports = router;
