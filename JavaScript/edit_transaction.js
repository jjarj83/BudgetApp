const { ipcRenderer } = require('electron')
const querystring = require('querystring')
const categoryFunctions = require('../Server_Functions/category_functions.js')
const transactionFunctions = require('../Server_Functions/transaction_functions.js')

let query = querystring.parse(global.location.search);
let id = query['?id'];
let type = query['type'];


window.addEventListener('load', (event) => {
  console.log(id);

  if (type === "transaction") {

    let transaction = transactionFunctions.getTransaction(id).then(
      function (response) {
        transaction = response;
        console.log(transaction);
        document.getElementById(`parent-category`).addEventListener("change", function() { populateSubCategories(this.value, 0); });
        preFillForm(transaction, type);
      },
      function (error) {
        console.log(error);
      }
    );
  }

  if (type === "income") {
    console.log(id);

    document.getElementById('description-group').style.display = "None";
    document.getElementById('parent-category-group').style.display = "None";
    document.getElementById('sub-category-group').style.display = "None";

    let income = transactionFunctions.getIncome(id).then(
      function (response) {
        income = response;
        console.log(income);
        preFillForm(income, type);
      },
      function (error) {
        console.log(error);
      }
    );
  }

  document.getElementById(`save-transaction`).addEventListener("click", function() { saveTransaction(type); });
});


function preFillForm(data, type) {
  document.getElementById('date').value = data.date;
  document.getElementById('amount').value = data.amount;

  if (type === "transaction") {
    document.getElementById('description').value = data.name;
    populateParentCategories(data.pid, data.cid);
  }

}


function populateParentCategories(pid, cid) {
  let categories = categoryFunctions.getParentCategoriesNoStats().then(
    function (response) {
      categories = response;
      populateSubCategories(pid, cid);

      var html = "";
      categories.forEach(function(category) {
        if (category.id === pid) {
          html += `<option value="${category.id}" selected>${category.name}</option>`;
        } else {
          html += `<option value="${category.id}">${category.name}</option>`;
        }
      });
      document.getElementById(`parent-category`).innerHTML += html;
    },
    function (error) {
      console.log(error);
    }
  );
}


function populateSubCategories(pid, cid) {
  document.getElementById(`sub-category`).innerHTML = "";

  let categories = categoryFunctions.getSubCategoriesNoStats(pid).then(
    function (response) {
      categories = response;

      console.log(cid === 0);
      var html = "";

      html += `<option value=0>--Sub Category--</option>`;
      categories.forEach(function(category) {
        if (category.id === cid) {
          html += `<option value="${category.id}" selected>${category.name}</option>`;
        } else {
          html += `<option value="${category.id}">${category.name}</option>`;
        }
      });
      document.getElementById(`sub-category`).innerHTML += html;
    },
    function (error) {
      console.log(error);
    }
  );
}


function saveTransaction(type) {
  console.log("Here", id);
  var date = document.getElementById('date').value;
  var amount = document.getElementById('amount').value;

  if (type === "transaction") {
    var name = document.getElementById('description').value;
    var pid = document.getElementById('parent-category').value;
    var cid = document.getElementById('sub-category').value;

    var categoryId = pid;
    if (cid != 0) { categoryId = cid; }

    if (validateForm(name, date, amount, categoryId, type)) {
      console.log("Valid", id);

      transactionFunctions.editTransaction(id, name, date, amount, categoryId).then (
        function (response) {
          console.log(response);
          ipcRenderer.send('close-editTransaction');
        },
        function (error) {
          console.log(error);
        }
      );
    }
  }

  if (type === "income") {
    if (validateForm("", date, amount, "", type)) {
      console.log("Valid", id);

      transactionFunctions.editIncome(id, date, amount).then (
        function (response) {
          console.log(response);
          ipcRenderer.send('close-editIncome');
        },
        function (error) {
          console.log(error);
        }
      );
    }
  }
}


function validateForm(name, date, amount, categoryId, type) {
  var errors = 0;

  if (date === "") {
    errors++;
    document.getElementById("date").classList.add("is-invalid");
  }

  if (type === "transaction" && name === "") {
    errors++;
    document.getElementById("description").classList.add("is-invalid");
  }

  if (amount <= 0) {
    errors++;
    document.getElementById("amount").classList.add("is-invalid");
  }

  if (type == "transaction" && categoryId <= 0) {
    errors++;
    document.getElementById("parent-category").classList.add("is-invalid");
  }

  console.log(errors);

  if (errors > 0) { return false; }
  return true;
}
