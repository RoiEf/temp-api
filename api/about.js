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
  const request = req.body.request;
  console.log(req.body);

  if (request === "ids") {
    connection.query(
      "SELECT id FROM services WHERE active = 1",
      (err, results) => {
        if (err) {
          return res.send(err);
        } else {
          var ids = {
            id: []
          };
          for (var i = 0; i < results.length; i++) {
            ids.id.push(results[i].id);
          }
          res.status(200).json(ids);
        }
      }
    );
  } else if (request === "id") {
    const QUERY = `SELECT * FROM services WHERE id = ${req.body.id}`;
    connection.query(QUERY, (err, results) => {
      if (err) {
        return res.send(err);
      } else {
        res.status(200).json(results[0]);
      }
    });
  } else {
    const error = new Error("Bad request code");
    error.status = 501;
    next(error);
  }
});

module.exports = router;
