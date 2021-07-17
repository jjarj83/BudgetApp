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

  getCategories(connection);
  document.getElementById('add-parent-category').addEventListener("click", addParentCategory);
});

function getCategories(connection) {
  $query = `SELECT c.id, c.name, c.color, c.parent_category_id,
	           (SELECT s.amount FROM stats s WHERE c.id = s.category_id and s.stat_month = 5 and s.stat_year = 2021) as amount
	          FROM categories c`;

  connection.query($query, function(err, rows, fields) {
    var parentCategories = {};
    var childCategories = [];

    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    rows.forEach(function(row) {
      if (row.amount === null) { row.amount = 0; }
      if (!row.parent_category_id) {
        let parentCategory = {
          name: row.name,
          color: row.color,
          amount: row.amount,
          children: []
        };
        parentCategories[row.id] = parentCategory;
      }
    });


    rows.forEach(function(row) {
      if (row.amount === null) { row.amount = 0; }
      if (row.parent_category_id) {
        let childCategory = {
          id: row.id,
          name: row.name,
          amount: row.amount,
          pid: row.parent_category_id
        };
        parentCategories[row.parent_category_id].children.push(childCategory);
      }
    });

    console.log("1.", parentCategories);
    populateTable(parentCategories);
  });
}

function populateTable(parentCategories) {
  var table = document.getElementById('table-body');
  for (const pid in parentCategories) {
    var tableRow = table.insertRow();
    tableRow.style.backgroundColor = parentCategories[pid].color;

    if (parentCategories[pid].children.length > 0) {
      tableRow.insertCell().innerHTML = `<button id="expand__${pid}" class="btn btn-sm"><i class ="fas fa-chevron-down"></i></button>`;
      document.getElementById(`expand__${pid}`).addEventListener("click", function(){ toggleSubCategories(pid); })
    } else { tableRow.insertCell(); }

    tableRow.insertCell().innerHTML = parentCategories[pid].name;
    tableRow.insertCell().innerHTML = parentCategories[pid].amount.toFixed(2);
    var html = `<button id="add__${pid}" class="btn btn-default btn-sm"><i class ="fas fa-plus"></i></button>
                <button id="edit__${pid}" class="btn btn-default btn-sm"><i class ="fas fa-edit"></i></button>
                <button id="delete__${pid}" class="btn btn-default btn-sm"><i class ="fas fa-trash-alt"></i></button>`;
    tableRow.insertCell().innerHTML = html;
    document.getElementById(`add__${pid}`).addEventListener("click", function(){ addSubCategory(pid); })

    parentCategories[pid].children.forEach(function(child) {
      var tableRow = table.insertRow();
      tableRow.style.display = "none";
      tableRow.setAttribute("name", `child__of__${pid}`);
      tableRow.insertCell();
      tableRow.insertCell().innerHTML = child.name;
      tableRow.insertCell().innerHTML = child.amount.toFixed(2);
      var html = `<button class="btn btn-default btn-sm" style="visibility: hidden;"><i class ="fas fa-plus"></i></button>
                  <button id="edit__${child.id}" class="btn btn-default btn-sm"><i class ="fas fa-edit"></i></button>
                  <button id="delete__${child.id}" class="btn btn-default btn-sm"><i class ="fas fa-trash-alt"></i></button>`;
      tableRow.insertCell().innerHTML = html;
    });

  }
}

function addParentCategory() {
  ipcRenderer.send('load-editCategory', 0);
}

function addSubCategory(pid) {
  ipcRenderer.send('load-editCategory', pid);
}

function toggleSubCategories(pid) {
  var rows = document.getElementsByName(`child__of__${pid}`);
  rows.forEach(function(row) {
    if (row.style.display === "none") { row.style.display = "table-row"; }
    else { row.style.display = "none"; }
  });
}
