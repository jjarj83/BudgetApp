const { ipcRenderer } = require('electron')
const mysql = require('mysql');

//document.getElementById('save-transaction').addEventListener("click", function() { addTransaction(); });

window.addEventListener('load', (event) => {
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

  document.getElementById('save-trade').addEventListener('click', function() { addTrade(connection); });
});

function addTrade(connection) {
  document.getElementById('buy-sell').classList.remove("is-invalid");
  document.getElementById('ticker-symbol').classList.remove("is-invalid");
  document.getElementById('share-count').classList.remove("is-invalid");
  document.getElementById('sale-price').classList.remove("is-invalid");

  var transaction_type = document.getElementById('buy-sell').value;
  var ticker = document.getElementById('ticker-symbol').value;
  var shares = document.getElementById('share-count').value;
  var salePrice = document.getElementById('sale-price').value;

  if (validateEntry(transaction_type, ticker, shares, salePrice)) {
    if (transaction_type === 'sell') {
       shares = -shares;
    }

    $query = `SELECT p.ticker, p.avg_cost, p.shares FROM positions p`;

    var positions = {};
    connection.query($query, function(err, rows, fields) {
      if (err) {
        console.log("An error occured performing the query.");
        console.log(err);
        return;
      }

      rows.forEach(function(row) {
        let position = {
          avgCost: row.avg_cost,
          shares: row.shares
        }
        positions[row.ticker] = position;
      });

      console.log(positions);
      if (positions[ticker]) {
        console.log("Exists");
        //convert values to numbers
        console.log(positions[ticker].shares);
        var newShares = positions[ticker].shares + Number(shares);
        console.log(newShares);
        console.log("Original Shares", positions[ticker].shares);
        console.log("Original Avg", positions[ticker].avgCost);
        console.log("New Shares", Number(shares));
        console.log("Sale Price", Number(salePrice));
        var avgCost = (positions[ticker].shares * positions[ticker].avgCost + Number(shares) * Number(salePrice)) / Number(newShares);
        console.log(ticker, newShares, avgCost);


        $query = `update positions
                  set shares = ?, avg_cost = ?
                  where ticker = ?`

        connection.query($query, [newShares, avgCost, ticker],
          function(err, rows, fields) {
          if (err) {
            console.log("An error occured performing the query.");
            console.log(err);
            return;
          }

          ipcRenderer.send('close-addTrade')
        });

      } else {
        console.log("New");

        $query = `insert into positions(ticker, shares, avg_cost)
                  values (?, ?, ?)`;

        connection.query($query, [ticker, shares, salePrice],
          function(err, rows, fields) {
          if (err) {
            console.log("An error occured performing the query.");
            console.log(err);
            return;
          }

          ipcRenderer.send('close-addTrade');
        });
      }
    })

  }
}

function validateEntry(transaction_type, ticker, shares, salePrice) {
  var errors = 0;

  if (transaction_type === "") {
    errors++;
    document.getElementById("buy-sell").classList.add("is-invalid");
  }

  fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=a33d6a7f9b717b8524e76aa0418eb34b`)
    .then(function(response) {
      response.json().then(function(data) {
        if (!data[0]) {
          document.getElementById("ticker-symbol").classList.add("is-invalid");
          errors++;
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      errors++;
    });

  if (shares === "") {
    errors++;
    document.getElementById("share-count").classList.add("is-invalid");
  } else if (parseFloat(shares) < 0) {
    errors++;
    document.getElementById("share-count").classList.add("is-invalid");
  }

  if (salePrice === "") {
    errors++;
    document.getElementById("salePrice").classList.add("is-invalid");
  } else if (parseFloat(salePrice) < 0) {
    errors++;
    document.getElementById("salePrice").classList.add("is-invalid");
  }

  console.log(errors);

  if (errors > 0) { return false; }
  return true;
}
