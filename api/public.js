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

router.get("/", (req, res, next) => {
  const QUERY = `SELECT * FROM thiot ORDER BY id DESC LIMIT 10`;
  connection.query(QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      res.status(200).json(results);
    }
  });
  console.log("/public API was called.");
});

router.get("/:number", (req, res, next) => {
  const QUERY = `SELECT * FROM thiot ORDER BY id DESC LIMIT ${
    req.params.number
  }`;
  connection.query(QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      res.status(200).json(results);
    }
  });
  console.log("/public API was called with number.");
});

connection.end();

module.exports = router;
