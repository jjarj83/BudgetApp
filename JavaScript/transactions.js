const { ipcRenderer } = require('electron')
const categoryFunctions = require('../Server_Functions/category_functions.js')
const transactionFunctions = require('../Server_Functions/transaction_functions.js')
const csv = require('jquery-csv')

var transactionCount = 1; var incomeCount = 1;
let $ = require('jquery');
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
var startDate = yyyy + '-' + mm + '-01';
var endDate = yyyy + '-' + mm + '-' + dd;
document.getElementById('transaction-start-date').value = startDate;
document.getElementById('transaction-end-date').value = endDate;
document.getElementById('income-start-date').value = startDate;
document.getElementById('income-end-date').value = endDate;

window.addEventListener('load', (event) => {
  $(function() {
    $("#sidebar").load("sidebar.html");
  })

  let transactions = transactionFunctions.getTransactions(startDate, endDate).then(
    function (response) {
      transactions = response;
      console.log(transactions);
      getTransactions(transactions);
    },
    function (error) {
      console.log(error);
    }
  );

  let incomes = transactionFunctions.getIncomes(startDate, endDate).then(
    function (response) {
      incomes = response;
      console.log(incomes);
      getIncomes(incomes);
    },
    function (error) {
      console.log(error);
    }
  );

  document.getElementById('save-transactions').addEventListener("click", function() { addTransactions(); });
  document.getElementById('save-incomes').addEventListener("click", function() { addIncomes(); });
  document.getElementById('file-upload').addEventListener("click", function() { readFile(); });
  document.getElementById('file-select').addEventListener("input", function() { updateLabel(); });
  document.getElementById('transaction-filter').addEventListener("click", function() { reloadTransactions(); });
  document.getElementById('income-filter').addEventListener("click", function() { reloadIncomes(); });
});


function getTransactions(transactions) {
  var table = document.getElementById('transaction-table-body');
  transactions.forEach(function(transaction) {
    var tableRow = table.insertRow();
    tableRow.id = `transaction__${transaction.id}`;
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
    document.getElementById(`delete__${transaction.id}`).addEventListener("click", function() { deleteTransaction(transaction.id); });
  });

  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-transaction-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="transaction-date-${transactionCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="transaction-name-${transactionCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="transaction-amount-${transactionCount}"/>`;

  var html = `<select class="custom-select custom-select-sm" id="parent-category-${transactionCount}">
                <option value=0>--Parent Category--</option>
              </select>`;
  tableRow.insertCell().innerHTML = html;

  html = `<select class="custom-select custom-select-sm" id="sub-category-${transactionCount}">
            <option value=0>--Sub Category--</option>
          </select>`;
  tableRow.insertCell().innerHTML = html;

  document.getElementById(`parent-category-${transactionCount}`).addEventListener("change", function() { populateSubCategories(this); addTransactionRow(); });
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
      document.getElementById(`parent-category-${transactionCount}`).innerHTML += html;
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
function addTransactionRow() {
  document.getElementById(`parent-category-${transactionCount}`).removeEventListener("change", function() { populateSubCategories(this); addTransactionRow(); });
  transactionCount++;
  console.log(transactionCount);

  var table = document.getElementById('transaction-table-body');
  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-transaction-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="transaction-date-${transactionCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="transaction-name-${transactionCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="transaction-amount-${transactionCount}"/>`;

  var html = `<select class="custom-select custom-select-sm" id="parent-category-${transactionCount}">
                <option value=0>--Parent Category--</option>
              </select>`;
  tableRow.insertCell().innerHTML = html;

  html = `<select class="custom-select custom-select-sm" id="sub-category-${transactionCount}">
            <option value=0>--Sub Category--</option>
          </select>`;
  tableRow.insertCell().innerHTML = html;

  document.getElementById(`parent-category-${transactionCount}`).addEventListener("change", function() { populateSubCategories(this); addTransactionRow(); });
  tableRow.insertCell();
  populateParentCategories();
}


function addTransactions() {
  var elements = document.getElementsByName("add-transaction-row");
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
      reloadTransactions();
      //ipcRenderer.send('reload-transaction');
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
      console.log(newTransaction, "invalid Category");
    }

  });

  transactionFunctions.bulkAddTransactions(transactionsArray).then(
    function (response) {
      reloadTransactions();
      //ipcRenderer.send('reload-transaction');
    },
    function (error) {
      console.log(error);
    }
  );

}


function deleteTransaction(transactionId) {
  if (confirm('Are you sure you want to delete this')) {
    console.log("Confirmed");
    transactionFunctions.removeTransaction(transactionId).then(
      function (response) {
        document.getElementById(`transaction__${transactionId}`).remove();
      },
      function (error) {
        console.log(error);
      }
    );
  } else {
    console.log("Not Confirmed");
    return false;
  }
}


function getIncomes(incomes) {
  var table = document.getElementById('income-table-body');
  incomes.forEach(function(income) {
    var tableRow = table.insertRow();
    tableRow.insertCell().innerHTML = income.date;
    tableRow.insertCell().innerHTML = income.name;
    tableRow.insertCell().innerHTML = income.amount.toFixed(2);

    var html = `<button id="edit__income__${income.id}" class="btn btn-default btn-sm"><i class ="fas fa-edit"></i></button>
                <button id="delete__income__${income.id}" class="btn btn-default btn-sm"><i class ="fas fa-trash-alt"></i></button>`;
    tableRow.insertCell().innerHTML = html;
    //document.getElementById(`delete__income__${income.id}`).addEventListener("click", function() { deleteIncome(income.id); });
  });

  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-income-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="income-date-${incomeCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="income-name-${incomeCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="income-amount-${incomeCount}"/>`;

  document.getElementById(`income-amount-${incomeCount}`).addEventListener("change", function() { addIncomeRow(); });
  tableRow.insertCell();
}


function addIncomes() {
  var elements = document.getElementsByName("add-income-row");
  var incomesArray = [];
  var i = 1;

  elements.forEach(function(e) {
    var date = document.getElementById(`income-date-${i}`).value;
    var name = document.getElementById(`income-name-${i}`).value;
    var amount = document.getElementById(`income-amount-${i}`).value;
    i++;

    if (validateIncome(name, date, amount)) {
      let incomeArray = [name, date, amount];
      incomesArray.push(incomeArray);
    }

  });

  transactionFunctions.bulkAddIncomes(incomesArray).then(
    function (response) {
      reloadIncomes();
      //ipcRenderer.send('reload-transaction');
    },
    function (error) {
      console.log(error);
    }
  );
}


function validateIncome(date, name, amount) {
  if (date === "" || name === "" || amount === "") {
    return false;
  }

  return true;
}


function addIncomeRow() {
  document.getElementById(`income-amount-${transactionCount}`).removeEventListener("change", function() { addIncomeRow(); });
  incomeCount++;

  var table = document.getElementById('income-table-body');
  var tableRow = table.insertRow();
  tableRow.setAttribute("name", "add-income-row");
  tableRow.insertCell().innerHTML = `<input type="date" class="form-control form-control-sm" id="income-date-${incomeCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="Description" id="income-name-${incomeCount}"/>`;
  tableRow.insertCell().innerHTML = `<input type="text" class="form-control form-control-sm" placeholder="0.00" id="income-amount-${incomeCount}"/>`;

  document.getElementById(`income-amount-${incomeCount}`).addEventListener("change", function() { addIncomeRow(); });
  tableRow.insertCell();
}


function reloadTransactions() {
  startDate = document.getElementById('transaction-start-date').value;
  //console.log(startDate);
  endDate = document.getElementById('transaction-end-date').value;

  let transactions = transactionFunctions.getTransactions(startDate, endDate).then(
    function (response) {
      document.getElementById('transaction-table-body').innerHTML = "";
      transactions = response;
      console.log(transactions);
      getTransactions(transactions);
    },
    function (error) {
      console.log(error);
    }
  );
}


function reloadIncomes() {
  startDate = document.getElementById('income-start-date').value;
  //console.log(startDate);
  endDate = document.getElementById('income-end-date').value;

  let incomes = transactionFunctions.getIncomes(startDate, endDate).then(
    function (response) {
      document.getElementById('income-table-body').innerHTML = "";
      incomes = response;
      console.log(incomes);
      getIncomes(incomes);
    },
    function (error) {
      console.log(error);
    }
  );
}
