const { ipcRenderer } = require('electron')
const categoryFunctions = require('../Server/category_functions.js')
const transactionFunctions = require('../Server/transaction_functions.js')
const csv = require('jquery-csv')
var count = 1; var reloadCount = 0;
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
    tableRow.insertCell().innerHTML = transaction.category;
    var html = `<button id="edit__${transaction.id}" class="btn btn-default btn-sm"><i class ="fas fa-edit"></i></button>
                <button id="delete__${transaction.id}" class="btn btn-default btn-sm"><i class ="fas fa-trash-alt"></i></button>`;
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
  document.getElementById(`transaction-category-${count}`).addEventListener("change", function() { addRow(); });
  tableRow.insertCell();
  populateCategories();
}


function populateCategories() {
  let categories = categoryFunctions.getCategoriesNoStats().then(
    function (response) {
      categories = response;

      var html = "";
      categories.forEach(function(category) {
        if (!category.pid) {
          html += `<option value="${category.id}">${category.name}</option>`;
        }
      });
      document.getElementById(`parent-category-${count}`).innerHTML = html;

      html = "";
      categories.forEach(function(category) {
        if (category.pid) {
          html += `<option value="${category.id}">${category.name}</option>`;
        }
      });
      document.getElementById(`sub-category-${count}`).innerHTML = html;
    },
    function (error) {
      console.log(error);
    }
  );
}

//fix
function addRow() {
  document.getElementById(`transaction-date-${count}`).removeEventListener("change", function() { addRow(); });
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
  document.getElementById(`transaction-category-${count}`).addEventListener("change", function() { addRow(); });
  tableRow.insertCell();
  populateCategories();
}


function addTransactions() {
  var elements = document.getElementsByName("add-row");
  var i = 1;
  elements.forEach(function(e) {
    var date = document.getElementById(`transaction-date-${i}`).value;
    var name = document.getElementById(`transaction-name-${i}`).value;
    var amount = document.getElementById(`transaction-amount-${i}`).value;
    var category = document.getElementById(`transaction-category-${i}`).value;
    i++;

    if (validateTransaction(name, date, amount, category)) {

      transactionFunctions.addTransaction(name, date, amount, category).then(
        function (response) {
          console.log(response);
          reload();
        },
        function (error) {
          console.log(error);
          return;
        }
      )
    } else {
      reload();
    }
  });
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


function reload() {
  reloadCount++;
  console.log(reloadCount);
  if (reloadCount === count) {
    console.log("Reload");
    ipcRenderer.send('reload-transaction');
  }
}
