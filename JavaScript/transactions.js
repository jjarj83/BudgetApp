const { ipcRenderer } = require('electron')
const categoryFunctions = require('../Server_Functions/category_functions.js')
const transactionFunctions = require('../Server_Functions/transaction_functions.js')
const csv = require('jquery-csv')
var count = 1;
let $ = require('jquery');

window.addEventListener('load', (event) => {
  $(function() {
    $("#sidebar").load("sidebar.html");
  })

  let transactions = transactionFunctions.getTransactions().then(
    function (response) {
      transactions = response;
      console.log(transactions);
      getTransactions(transactions);
    },
    function (error) {
      console.log(error);
    }
  );

  document.getElementById('save-transactions').addEventListener("click", function() { addTransactions(); });
  document.getElementById('file-upload').addEventListener("click", function() { readFile(); });
  document.getElementById('file-select').addEventListener("input", function() { updateLabel(); });
});

function getTransactions(transactions) {
  var table = document.getElementById('table-body');
  transactions.forEach(function(transaction) {
    var tableRow = table.insertRow();
    tableRow.insertCell().innerHTML = transaction.date;
    tableRow.insertCell().innerHTML = transaction.name;
    tableRow.insertCell().innerHTML = transaction.amount.toFixed(2);

    if (transaction.parentCategory) {
      tableRow.insertCell().innerHTML = transaction.parentCategory;
      tableRow.insertCell().innerHTML = transaction.category;
    } else {
      tableRow.insertCell().innerHTML = transaction.category;
      tableRow.insertCell();
    }

    var html = `<button id="edit__${transaction.id}" class="btn btn-default btn-sm"><i class ="fas fa-edit"></i></button>
                <button id="delete__${transaction.id}" class="btn btn-default btn-sm"><i class ="fas fa-trash-alt"></i></button>`;
    tableRow.insertCell().innerHTML = html;
  });

  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="transaction-date-${count}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="transaction-name-${count}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="transaction-amount-${count}"/>`;

  var html = `<select class="custom-select custom-select-sm" id="parent-category-${count}">
                <option value=0>--Parent Category--</option>
              </select>`;
  tableRow.insertCell().innerHTML = html;

  html = `<select class="custom-select custom-select-sm" id="sub-category-${count}">
            <option value=0>--Sub Category--</option>
          </select>`;
  tableRow.insertCell().innerHTML = html;

  document.getElementById(`parent-category-${count}`).addEventListener("change", function() { populateSubCategories(this); addRow(); });
  tableRow.insertCell();
  populateParentCategories();
}


function populateParentCategories() {
  let categories = categoryFunctions.getParentCategoriesNoStats().then(
    function (response) {
      categories = response;

      var html = "";
      categories.forEach(function(category) {
        html += `<option value="${category.id}">${category.name}</option>`;
      });
      document.getElementById(`parent-category-${count}`).innerHTML += html;
    },
    function (error) {
      console.log(error);
    }
  );
}


function populateSubCategories(element) {
  var num = element.id.split('-')[2];
  console.log(num);
  let categories = categoryFunctions.getSubCategoriesNoStats(element.value).then(
    function (response) {
      categories = response;

      var html = "";
      categories.forEach(function(category) {
        html += `<option value="${category.id}">${category.name}</option>`;
      });
      document.getElementById(`sub-category-${num}`).innerHTML += html;
    },
    function (error) {
      console.log(error);
    }
  );

}


//fix
function addRow() {
  document.getElementById(`transaction-date-${count}`).removeEventListener("change", function() { populateSubCategories(this); addRow(); });
  count++;
  console.log(count);

  var table = document.getElementById('table-body');
  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="transaction-date-${count}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="transaction-name-${count}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="transaction-amount-${count}"/>`;

  var html = `<select class="custom-select custom-select-sm" id="parent-category-${count}">
                <option value=0>--Parent Category--</option>
              </select>`;
  tableRow.insertCell().innerHTML = html;

  html = `<select class="custom-select custom-select-sm" id="sub-category-${count}">
            <option value=0>--Sub Category--</option>
          </select>`;
  tableRow.insertCell().innerHTML = html;

  document.getElementById(`parent-category-${count}`).addEventListener("change", function() { populateSubCategories(this); addRow(); });
  tableRow.insertCell();
  populateParentCategories();
}


function addTransactions() {
  var elements = document.getElementsByName("add-row");
  var transactionsArray = [];
  var i = 1;

  elements.forEach(function(e) {
    var date = document.getElementById(`transaction-date-${i}`).value;
    var name = document.getElementById(`transaction-name-${i}`).value;
    var amount = document.getElementById(`transaction-amount-${i}`).value;
    var parentCategory = document.getElementById(`parent-category-${i}`).value;
    var subCategory = document.getElementById(`sub-category-${i}`).value;
    i++;

    if (validateTransaction(name, date, amount, parentCategory)) {
      var category = parentCategory;
      if (subCategory != 0 ) { category = subCategory; }
      let transactionArray = [name, date, amount, category];
      transactionsArray.push(transactionArray);
    }

  });

  transactionFunctions.bulkAddTransactions(transactionsArray).then(
    function (response) {
      ipcRenderer.send('reload-transaction');
    },
    function (error) {
      console.log(error);
    }
  );
}


function validateTransaction(date, name, amount, category) {
  if (date === "" || name === "" || amount === "" || category === "") {
    return false;
  }

  return true;
}


function updateLabel() {
  var file = document.getElementById('file-select').files[0].name;
  console.log(file);
  document.getElementById('file-label').innerHTML = file;
}


function readFile() {
  var fileInput = document.getElementById('file-select');
  var file = fileInput.files[0];

  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {

    var csvFile = event.target.result;
    var newTransactions = csv.toArrays(csvFile);
    console.log(newTransactions);

    let categoriesHash = categoryFunctions.getCategoriesHash().then(
      function (response) {
        categoriesHash = response;
        bulkAdd(newTransactions, categoriesHash);
      },
      function (error) {
        console.log(error);
      }
    );
  }
}


function bulkAdd(newTransactions, categoriesHash) {
  var transactionsArray = [];
  newTransactions.forEach(function(newTransaction) {

    if (newTransaction[3] in categoriesHash) {
      var id = categoriesHash[newTransaction[3]].id;
      var children = categoriesHash[newTransaction[3]].children;

      if (newTransaction[4] && newTransaction[4] in categoriesHash[newTransaction[3]].children) {
        id = categoriesHash[newTransaction[3]].children[newTransaction[4]];
      }

      var date = new Date(newTransaction[0]).toLocaleDateString('fr-CA');
      var transactionArray = [newTransaction[1], date, newTransaction[2], id];
      transactionsArray.push(transactionArray);

    } else {
      console.log(newTransaction[3], "does not exist");
    }

  });

  transactionFunctions.bulkAddTransactions(transactionsArray).then(
    function (response) {
      ipcRenderer.send('reload-transaction');
    },
    function (error) {
      console.log(error);
    }
  );

}
