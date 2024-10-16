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
      {
        machine: 1,
        files: backend1Response.data,
      },
      {
        machine: 2,
        files: backend2Response.data,
      }
    ];

    res.json(combinedResults);
  } catch (error) {
    console.error("Error fetching logfiles:", error);
    res.status(500).send("Error fetching logfiles");
  }
});

router.get("/logs", async (req, res) => {
  const { file, machine, n, search } = req.query;

  const queryParams = {};
  if (file) queryParams.file = file;
  if (n) queryParams.n = n;
  if (search) queryParams.search = search;

  const queryParamsStr = new URLSearchParams(queryParams).toString();
  const queryParamsIfExists = queryParamsStr ? `?${queryParamsStr}` : '';

  try {
    if (file) {
      if (machine === undefined) {
        return res.status(400).send({ error: "If specifying 'file' query parameter, a 'machine' query param must also be passed" });
      }
      let response;
      if (machine == 1) {
        response = await axios.get(`${LOG_FILE_HOST_1}/api/logs${queryParamsIfExists}`);
      } else { // machine 2
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
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error getting log file output from downstream hosts" });
  }
});

module.exports = router;
