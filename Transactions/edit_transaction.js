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

  getParentCategories(connection);
  document.getElementById('parent-category').addEventListener('change', function() { getSubCategories(connection, this.value); });
  document.getElementById('save-transaction').addEventListener('click', function() { addTransaction(connection); });
});

function getParentCategories(connection) {
  $query = 'SELECT id, name FROM categories WHERE parent_category_id is null';

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      opt = document.createElement('OPTION');
      opt.textContent = row.name;
      opt.value = row.id;
      document.getElementById("parent-category").appendChild(opt);
    });

  });
}

function getSubCategories(connection, parent_category_id) {
  let select = document.getElementById("sub-category");
  select.innerHTML = "";
  opt = document.createElement('OPTION');
  opt.textContent = '--Sub Category--'
  opt.value = 0;
  select.appendChild(opt);

  $query = `SELECT id, name FROM categories WHERE parent_category_id = ?`;

  connection.query($query, parent_category_id, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      opt = document.createElement('OPTION');
      opt.textContent = row.name;
      opt.value = row.id;
      select.appendChild(opt);
    });

    select.disabled = false;
  })
}

function addTransaction(connection) {
  var date = document.getElementById('transaction-date').value;
  var name = document.getElementById('transaction-name').value;
  var amount = document.getElementById('transaction-amount').value;
  var parentCategory = document.getElementById('parent-category').value;
  var subCategory = document.getElementById('sub-category').value;


  if (validateTransaction(date, name, amount, parentCategory, subCategory)) {

    var category = (subCategory === '0') ? parentCategory : subCategory;

    console.log(date, name, amount, category);

    $query = `call add_transaction(?, ?, ?, ?)`;

    connection.query($query, [name, date, amount, category], function(err, rows, fields) {
      if (err) {
        console.log("An error occured performing the query.");
        console.log(err);
        return;
      }

      ipcRenderer.send('close-editTransaction')
    });
  }

}

function validateTransaction(date, name, amount, parentCategory, subCategory) {
  var errors = 0;
  console.log(parentCategory);

  if (date === "") {
    errors++;
    document.getElementById("transaction-date").classList.add("is-invalid");
  }

  if (name === "") {
    errors++;
    document.getElementById("transaction-name").classList.add("is-invalid");
  }

  if (amount === "") {
    errors++;
    document.getElementById("transaction-amount").classList.add("is-invalid");
  }

  if (parentCategory === '0') {
    errors++;
    document.getElementById("parent-category").classList.add("is-invalid");
  }
  console.log(errors);

  if (errors > 0) { return false; }
  return true;
}
