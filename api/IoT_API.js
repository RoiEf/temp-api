const express = require("express");
const router = express.Router();

const mysql = require("mysql");
/*
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
*/

var db_config = {
  host: "localhost",
  port: 3306,
  user: "tempSrv",
  password: "12345",
  database: "tempsrv"
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

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

module.exports = router;
