const express = require("express");
const os = require("os");
const mysql = require("mysql");

const router = express.Router();

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

connection.end();

module.exports = router;