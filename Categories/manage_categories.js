const { ipcRenderer } = require('electron')

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

  getParentCategories(connection, printCategory);

  document.getElementById('add-parent-category').addEventListener("click", addParentCategory);
});

function getParentCategories(connection, callback) {
  $query = `SELECT c.id, c.name, c.color,
	           (SELECT s.amount FROM stats s WHERE c.id = s.category_id and s.stat_month = 5 and s.stat_year = 2021) as amount
	          FROM categories c
	          WHERE c.parent_category_id is null`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      printCategory(connection, row.id, row.name, row.amount, row.color);
    });
  });
}

function printCategory(connection, pid, pname, pamount, pcolor) {

  if (pamount === null) { pamount = 0; }

  var html = '<div class=""flex-child"">';
  html += '<table class="table table-striped table-bordered table-hover">';
  html += '<thead class="thead-dark">';
  html += '<tr>';
  html += '<th>' + pname + '</th>';
  html += '<th>Total:</th>';
  html += '<th>' + pamount.toFixed(2) + '</th>';
  html += '<th>';
  html += '<button type="button" class="btn btn-outline-primary btn-sm">Edit</button>';
  html += '</th>';
  html += '<th>';
  html += '<button type="button" class="btn btn-secondary btn-sm">Delete</button>';
  html += '</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  $query = `SELECT c.id, c.name,
	           (select s.amount from stats s where c.id = s.category_id and s.stat_month = 5 and s.stat_year = 2021) as amount
	          FROM categories c
	          WHERE c.parent_category_id = ?`;

  connection.query($query, pid, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      if (row.amount === null) { row.amount = 0; }

      html += '<tr>';
      html += '<td>' + row.name + '</td>';
      html += '<td>Total:</td>';
      html += '<td>' + row.amount.toFixed(2) + '</td>';
      html += '<td>';
      html += '<button type="button" class="btn btn-primary btn-sm">Edit</button>';
      html += '</td>';
      html += '<td>';
      html += '<button type="button" class="btn btn-secondary btn-sm">Delete</button>';
      html += '</td>';
      html += '</tr>';
    });

    html += '</tbody>'
    html += '</table>';
    html += '<button type="button" value="' + pid + '"class="btn btn-primary">Add Sub-Category</button>'
    html += '</div>';

    document.getElementById('container').innerHTML += html;
    var elements = document.getElementsByClassName("btn btn-primary");

    Array.from(elements).forEach(function(element) {
      element.addEventListener("click", function(){ addSubCategory(element.value); });
    });
  });
}

function addParentCategory() {
  ipcRenderer.send('load-editCategory', 0);
}

function addSubCategory(pid) {
  ipcRenderer.send('load-editCategory', pid);
}
