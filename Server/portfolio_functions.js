var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'budget_app'
});

connection.connect(function(err) {
  if (err) {
    console.log(err.code);
    console.log(err.fatal);
  }
});


exports.getPositions = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT p.ticker, p.shares, p.avg_cost
              FROM positions p
              WHERE p.shares > 0`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      var positions = [];
      rows.forEach(function(row) {
        let position = {
          ticker: row.ticker,
          shares: row.shares,
          avg_cost: row.avg_cost
        };
        positions.push(position);
      });
      resolve(positions);
    });
  });
}


exports.getTickers = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT p.ticker, p.shares, p.avg_cost
              FROM positions p
              WHERE p.shares > 0`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      var tickers = [];
      rows.forEach(function(row) {
        tickers.push(row.ticker);
      });
      resolve(tickers);
    });
  });
}


exports.updatePosition = function(ticker, newShares, salePrice) {
  return new Promise(function (resolve, reject) {
    $query = `SELECT avg_cost, shares FROM positions where ticker = ?`

    connection.query($query, [ticker],
    function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      var totalShares = rows[0].shares + Number(newShares);
      var avgCost = (rows[0].shares * rows[0].avg_cost + Number(newShares) *
                    Number(salePrice)) / Number(newShares);

      $query = `UPDATE positions
                SET shares = ?, avg_cost = ?
                WHERE ticker = ?`

      connection.query($query, [totalShares, avgCost, ticker],
        function(error, rows, fields) {
          if (err) {
            reject(err);
          }
          resolve("Success");
      });
    });
  });
}


exports.newPosition = function(ticker, shares, salePrice) {
  return new Promise(function (resolve, reject) {
    $query = `INSERT into positions(ticker, shares, avg_cost)
              VALUES (?, ?, ?)`

    connection.query($query, [ticker, shares, salePrice],
    function(err, rows, fields) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}
