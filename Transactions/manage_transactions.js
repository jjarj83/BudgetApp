const { ipcRenderer } = require('electron')

window.addEventListener('load', (event) => {
  var mysql = require('mysql');
  var $ = require('jquery');
  var dt = require('datatables.net')();

  $('document').ready(function() {
    $('#transactions-table').DataTable({
      "orderCellsTop": true,
      "pageLength": 50,
      "lengthMenu": [ [50, 100, 250, -1], [50, 150, 250, "All"] ],
      "language": { "search": "Filter Records:" },
    });
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

  getTransactions(connection, $);
  document.getElementById('add-transaction').addEventListener('click', addTransaction);
});

function getTransactions(connection, $) {
  $query = `SELECT  t.id, date_format(t.date, '%m-%d-%Y') as date, t.name, t.amount, c.name as category
            FROM    transactions t, categories c
            WHERE   t.category_id = c.id;`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var t = $('#transactions-table').DataTable();
    rows.forEach(function(r) {
      t.row.add([
        r.date,
        r.name,
        r.amount.toFixed(2),
        r.category,
        'Edit',
        'Delete'
      ]).draw(false);
    });
  });

}

function addTransaction() {
  ipcRenderer.send('load-editTransaction');
}
