const express = require("express");
const router = express.Router();

const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "tempSrv",
  password: "12345",
  database: "tempsrv"
});
connection.connect(err => {
  if (err) {
    return err;
  }
});

router.post("/", (req, res, next) => {
  console.log(req.body);
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const temprature = req.body.temp;
  const humidity = req.body.humid;
  if (
    longitude <= 180 &&
    longitude >= -180 &&
    latitude <= 90 &&
    latitude >= -90
  ) {
    if (
      humidity >= 0 &&
      humidity <= 100 &&
      temprature >= -20 &&
      temprature <= 50
    ) {
      const QUERY = `INSERT INTO thiot
                                 (longitude, latitude, temprature, humidity)
                          VALUES (${longitude},${latitude},${temprature},${humidity})`;
      connection.query(QUERY, (err, results) => {
        if (err) {
          return res.send(err);
        } else {
          res.status(201).json({
            message: "response from IoT API Post",
            status: "All OK. Data added"
          });
        }
      });
    } else {
      const error = new Error("Data out of range");
      error.status = 501;
      next(error);
    }
  } else {
    const error = new Error("Bad coordinates");
    error.status = 501;
    next(error);
  }
});

connection.end();

module.exports = router;
