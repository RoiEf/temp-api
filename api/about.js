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
connection.connect(err => {                               // The server is either down
  if (err) {                                              // or restarting (takes a while sometimes).
    console.log('error when connecting to db:', err);
    setTimeout(handleDisconnect, 2000);                   // We introduce a delay before attempting to reconnect,
  }                                                       // to avoid a hot loop, and to allow our node script to
});                                                       // process asynchronous requests in the meantime.
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
