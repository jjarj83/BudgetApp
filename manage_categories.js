const { ipcRenderer } = require('electron')

class ParentCategory {
  constructor(id, name, total, color) {
    this.id = id;
    this.name = name;
    this.total = total;
    this.color = color;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
  }
}

class ChildCategory {
  constructor(id, name, total) {
    this.id = id;
    this.name = name;
    this.total = total;
  }
}

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
});

document.getElementById('add-category-button').addEventListener("click", addCategory);

function getParentCategories(connection, callback) {
  $query = 'SELECT id, name, total, color FROM categories WHERE parent_category_id is null';

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      printCategory(connection, row.id, row.name, row.total, row.color);
    });
  });
}

function printCategory(connection, pid, pname, ptotal, pcolor) {

  var html = '<div class="flex-child">';
  html += '<table class="category-table">';
  html += '<tr>';
  html += '<th>' + pname + '</th>';
  html += '<th>Total:</th>';
  html += '<th>' + ptotal + '</th>';
  html += '<th>';
  html += '<button type="button" class="edit-button">Edit</button>';
  html += '</th>';
  html += '<th>';
  html += '<button type="button" class="edit-button">Delete</button>';
  html += '</th>';
  html += '</tr>';

  $query = 'SELECT id, name, total FROM categories WHERE parent_category_id = ' + pid;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      html += '<tr>';
      html += '<td>' + row.name + '</td>';
      html += '<td>Total:</td>';
      html += '<td>' + row.total + '</td>';
      html += '<td>';
      html += '<button type="button" class="edit-button">Edit</button>';
      html += '</td>';
      html += '<td>';
      html += '<button type="button" class="edit-button">Delete</button>';
      html += '</td>';
      html += '</tr>';
    });

    html += '</table>';
    html += '</div>';

    document.getElementById('container').innerHTML += html;
  });
}

function addCategory() {
  ipcRenderer.send('load-editCategory');
}
