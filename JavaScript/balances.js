const { ipcRenderer } = require('electron')
const balanceFunctions = require('../Server/balance_functions.js')

window.addEventListener('load', (event) => {
  var $ = require('jquery');

  $(function() {
    $("#sidebar").load("sidebar.html");
  });

  let balances = balanceFunctions.getBalances().then(
    function (response) {
      balances = response;
      console.log(balances);
      populateTable(balances);
    },
    function (error) {
      console.log(error);
    }
  );

  document.getElementById('add-entry').addEventListener('click', addEntry);
});

function populateTable(balances) {
  var table = document.getElementById('table-body');
  balances.forEach(function(entry) {
    var tableRow = table.insertRow();
    tableRow.insertCell().innerHTML = entry.date;
    tableRow.insertCell().innerHTML = entry.checking.toFixed(2);
    tableRow.insertCell().innerHTML = entry.savings.toFixed(2);
    tableRow.insertCell().innerHTML = entry.fouronek.toFixed(2);
    tableRow.insertCell().innerHTML = entry.ira.toFixed(2);
    tableRow.insertCell().innerHTML = entry.hsa.toFixed(2);
    tableRow.insertCell().innerHTML = entry.other_investments.toFixed(2);
    tableRow.insertCell().innerHTML = '';
    tableRow.insertCell().innerHTML = entry.loans.toFixed(2);
    tableRow.insertCell().innerHTML = entry.credit_cards.toFixed(2);
    tableRow.insertCell().innerHTML = '';
    tableRow.insertCell().innerHTML = entry.total.toFixed(2);
  });

}

function addEntry() {
  ipcRenderer.send('load-editEntry');
}
