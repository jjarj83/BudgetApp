const { ipcRenderer } = require('electron')
const categoryFunctions = require('../Server/categoryFunctions.js');

window.addEventListener('load', (event) => {
  var $ = require('jquery');

  $(function() {
    $("#sidebar").load("sidebar.html");
  });

  let categories = categoryFunctions.getCategories().then(
    function (response) {
      categories = response;
      console.log(categories);
      populateTable(categories);
    },
    function (error) {
      console.log(error);
    }
  );

  document.getElementById('add-parent-category').addEventListener("click", addParentCategory);
});


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
