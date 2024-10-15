const express = require("express");
const router = express.Router();

const axios = require("axios");
const {
  LOG_FILE_HOST_1,
  LOG_FILE_HOST_2,
} = require("../config");

router.get("/logfiles-list", async (req, res) => {
  try {
    const [backend1Response, backend2Response] = await Promise.all([
      axios.get(`${LOG_FILE_HOST_1}/api/logfile-list`),
      axios.get(`${LOG_FILE_HOST_2}/api/logfile-list`),
    ]);

    const combinedResults = [
      ...backend1Response.data,
      ...backend2Response.data,
    ];

    res.json(combinedResults);
  } catch (error) {
    console.error("Error fetching logfiles:", error);
    res.status(500).send("Error fetching logfiles");
  }
});

router.get("/logs", async (req, res) => {
  const { file, n, search } = req.query;

  const queryParams = {};
  if (file) queryParams.file = file;
  if (n) queryParams.n = n;
  if (search) queryParams.search = search;

  const queryParamsStr = new URLSearchParams(queryParams).toString();
  const queryParamsIfExists = queryParamsStr ? `?${queryParamsStr}` : '';

  if (file) {
    let response;
    const fileLookupResp = await axios.get(`${LOG_FILE_HOST_1}/api/logfile-list`);
    if (fileLookupResp.data.includes(file)) {
      response = await axios.get(`${LOG_FILE_HOST_1}/api/logs${queryParamsIfExists}`);
    } else {
      response = await axios.get(`${LOG_FILE_HOST_2}/api/logs${queryParamsIfExists}`);
    }
    res.json(response.data);
  } else {
    const [backend1Response, backend2Response] = await Promise.all([
      axios.get(`${LOG_FILE_HOST_1}/api/logs${queryParamsIfExists}`),
      axios.get(`${LOG_FILE_HOST_2}/api/logs${queryParamsIfExists}`),
    ]);

    const combinedResults = [
      ...backend1Response.data,
      ...backend2Response.data,
    ];

    res.json(combinedResults);
  }
});

module.exports = router;
