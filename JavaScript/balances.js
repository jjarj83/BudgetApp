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

  getEntries(connection);
  document.getElementById('add-entry').addEventListener('click', addEntry);
});

function getEntries(connection) {
  $query = `SELECT  date_format(be.entry_date, '%Y-%m-%d') as date, be.checking, be.savings,
                    be.401K as fouronek, be.ira, be.hsa, be.other_investments, be.loans,
                    be.credit_cards, be.total
            FROM    balance_entries be
            ORDER BY entry_date`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var table = document.getElementById('table-body');
    rows.forEach(function(row) {
      var tableRow = table.insertRow();
      tableRow.insertCell().innerHTML = row.date;
      tableRow.insertCell().innerHTML = row.checking.toFixed(2);
      tableRow.insertCell().innerHTML = row.savings.toFixed(2);
      tableRow.insertCell().innerHTML = row.fouronek.toFixed(2);
      tableRow.insertCell().innerHTML = row.ira.toFixed(2);
      tableRow.insertCell().innerHTML = row.hsa.toFixed(2);
      tableRow.insertCell().innerHTML = row.other_investments.toFixed(2);
      tableRow.insertCell().innerHTML = '';
      tableRow.insertCell().innerHTML = row.loans.toFixed(2);
      tableRow.insertCell().innerHTML = row.credit_cards.toFixed(2);
      tableRow.insertCell().innerHTML = '';
      tableRow.insertCell().innerHTML = row.total.toFixed(2);
    });
  });

}

function addEntry() {
  ipcRenderer.send('load-editEntry');
}
