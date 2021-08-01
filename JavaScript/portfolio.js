const { ipcRenderer } = require('electron')

window.addEventListener('load', (event) => {
  var $ = require('jquery');
  var mysql = require('mysql');

  $(function() {
    $("#sidebar").load("sidebar.html");
  });

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

  getPositions(connection);
  document.getElementById('new-trade').addEventListener('click', function() { addTrade(); });
});


function getPositions(connection) {
  $query = `SELECT p.ticker, p.shares, p.avg_cost
            FROM positions p
            WHERE p.shares > 0`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      fetch(`https://financialmodelingprep.com/api/v3/quote/${row.ticker}?apikey=a33d6a7f9b717b8524e76aa0418eb34b`)
        .then(function(response) {
          response.json().then(function(data) {
            console.log(data);
            addRow(row, data[0].price);
          });
        })
        .catch(function(err) {
          console.log(err);
        });
    });

  });
}


function addRow(row, price) {
  var balance = row.shares * price;
  var growth = balance - (row.avg_cost * row.shares);
  var pctChange = ((price - row.avg_cost) / row.avg_cost) * 100;
  var table = document.getElementById('table-body');
  var tableRow = table.insertRow();
  tableRow.insertCell().innerHTML = row.ticker;
  tableRow.insertCell().innerHTML = row.shares.toFixed(2);
  tableRow.insertCell().innerHTML = balance.toFixed(2);
  tableRow.insertCell().innerHTML = price.toFixed(2);
  tableRow.insertCell().innerHTML = row.avg_cost.toFixed(2);
  tableRow.insertCell().innerHTML = growth.toFixed(2);
  tableRow.insertCell().innerHTML = pctChange.toFixed(2);
  tableRow.insertCell();
}


function addTrade() {
  ipcRenderer.send('load-addTrade', 0);
}
