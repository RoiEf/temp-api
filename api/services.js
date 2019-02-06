const express = require("express");
const os = require("os");
const mysql = require("mysql");

const router = express.Router();
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

router.get("/:serviceId", (req, res, next) => {
  console.log(req.params);

  if (req.params.serviceId === "1") {
    res.status(200).json({
      id: req.params.serviceId,
      data: [
        { id: 0, lable: "Architecture", value: os.cpus()[0].model },
        { id: 1, lable: "CPU Speed", value: os.cpus()[0].speed },
        {
          id: 2,
          lable: "Total Memory",
          value:
            parseFloat(os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + "Gb"
        },
        {
          id: 3,
          lable: "Free Memory",
          value: parseFloat(os.freemem() / 1024 / 1024 / 1024).toFixed(2) + "Gb"
        }
      ]
    });
  } else if (req.params.serviceId === "2") {
    console.log("executing quary");
    connection.query("SELECT version() AS version", (err, results) => {
      if (err) {
        console.log("Was error");
        return res.send(err);
      } else {
        console.log(results[0].version);
        pos = results[0].version.indexOf("-");

        res.status(200).json({
          id: req.params.serviceId,
          data: [
            { id: 0, lable: "Name", value: "MariaDB" },
            {
              id: 1,
              lable: "Version",
              value: results[0].version.substr(0, pos)
            }
          ]
        });
      }
    });
  } else if (req.params.serviceId === "3") {
    console.log("executing quary");
    connection.query("SELECT version() AS version", (err, results) => {
      if (err) {
        console.log("Was error");
        return res.send(err);
      } else {
        console.log(results[0].version);

        res.status(200).json({
          id: req.params.serviceId,
          data: [
            { id: 0, lable: "OS", value: os.type() },
            { id: 1, lable: "Release", value: os.release() }
          ]
        });
      }
    });
  } else if (req.params.serviceId === "4") {
    console.log("Node version is: " + process.version);
    res.status(200).json({
      id: req.params.serviceId,
      data: [
        { id: 0, lable: "Name", value: "Node.JS" },
        { id: 1, lable: "Version", value: process.version }
      ]
    });
  } else {
    const error = new Error("Bad request code");
    error.status = 501;
    next(error);
  }

});

module.exports = router;