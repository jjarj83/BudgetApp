const { ipcRenderer } = require('electron')
var count = 1;
let mysql = require('mysql');
let $ = require('jquery');

window.addEventListener('load', (event) => {
  $(function() {
    $("#sidebar").load("sidebar.html");
  })

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

  getTransactions(connection);
  document.getElementById('save-transactions').addEventListener("click", function() { addTransactions(connection); });
});

function getTransactions(connection, $) {
  $query = `SELECT  t.id, date_format(t.date, '%m-%d-%Y') as date, t.name, t.amount, c.name as category
            FROM    transactions t, categories c
            WHERE   t.category_id = c.id
                    and t.date >= '2021-05-01'
            ORDER BY t.date`;

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
      tableRow.insertCell().innerHTML = row.name;
      tableRow.insertCell().innerHTML = row.amount.toFixed(2);
      tableRow.insertCell().innerHTML = row.category;
      var html = `<button id="edit__${row.id}" class="btn btn-default btn-sm"><i class ="fas fa-edit"></i></button>
                  <button id="delete__${row.id}" class="btn btn-default btn-sm"><i class ="fas fa-trash-alt"></i></button>`;
      tableRow.insertCell().innerHTML = html;
    });

    var tableRow = table.insertRow();
    tableRow.setAttribute("name", "add-row");
    tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="transaction-date-${count}"/>`;
    tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="transaction-name-${count}"/>`;
    tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="transaction-amount-${count}"/>`;
    var html = `<select class="custom-select custom-select-sm" id="transaction-category-${count}">
                  <option value=0>--Category--</option>
                  <optgroup id="parent-category-${count}" label="parentCategories"></optgroup>
                  <optgroup id="sub-category-${count}" label="subCategories"></optgroup>
                </select>`;
    tableRow.insertCell().innerHTML = html;
    document.getElementById(`transaction-category-${count}`).addEventListener("change", function() { addRow(connection); });
    tableRow.insertCell();
    populateCategories(connection);
  });

}

function populateCategories(connection) {
  $query = `SELECT c.id, c.name, c.parent_category_id
	          FROM categories c`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var html = "";
    rows.forEach(function(row) {
      if (!row.parent_category_id) {
        html += `<option value="${row.id}">${row.name}</option>`;
      }
    });
    document.getElementById(`parent-category-${count}`).innerHTML = html;

    html = "";
    rows.forEach(function(row) {
      if (row.parent_category_id) {
        html += `<option value="${row.id}">${row.name}</option>`;
      }
    });
    document.getElementById(`sub-category-${count}`).innerHTML = html;
  });


}

//fix
function addRow(connection) {
  document.getElementById(`transaction-date-${count}`).removeEventListener("change", function() { addRow(connection); });
  count++;
  console.log(count);

  var table = document.getElementById('table-body');
  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="transaction-date-${count}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="transaction-name-${count}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="transaction-amount-${count}"/>`;
  var html = `<select class="custom-select custom-select-sm" id="transaction-category-${count}" type="text" class="form-control">
                <option value=0>--Category--</option>
                <optgroup id="parent-category-${count}" label="parentCategories"></optgroup>
                <optgroup id="sub-category-${count}" label="subCategories"></optgroup>
              </select>`;
  tableRow.insertCell().innerHTML = html;
  document.getElementById(`transaction-category-${count}`).addEventListener("change", function() { addRow(connection); });
  tableRow.insertCell();
  populateCategories(connection);
}


function addTransactions(connection) {
  console.log("Here");
  var elements = document.getElementsByName("add-row");
  for (var i = 1; i <= elements.length; i++) {
    console.log("Here2");
    var date = document.getElementById(`transaction-date-${i}`).value;
    var name = document.getElementById(`transaction-name-${i}`).value;
    var amount = document.getElementById(`transaction-amount-${i}`).value;
    var category = document.getElementById(`transaction-category-${i}`).value;

    console.log(date, name, amount, category);

    if (validateTransaction(date, name, amount, category)) {

      $query = `call add_transaction(?, ?, ?, ?)`;

      connection.query($query, [name, date, amount, category], function(err, rows, fields) {
        if (err) {
          console.log("An error occured performing the query.");
          console.log(err);
          return;
        }

        ipcRenderer.send('reload-transaction')
      });
    }

  }

}

function validateTransaction(date, name, amount, category) {
  if (date === "" || name === "" || amount === "" || category === "") {
    return false;
  }

  return true;
}
