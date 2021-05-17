const { ipcRenderer } = require('electron')
const Chart = require('chart.js')

window.addEventListener('load', (event) => {
  document.getElementById('transactions-nav').addEventListener("click", loadTransactions);
  document.getElementById('categories-nav').addEventListener("click", loadCategories);

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

  var spc = document.getElementById('spending-chart');
  var spendingChart = new Chart(spc, {
    type: 'pie',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [
        {
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ]
        }
      ]
    }
  });
});

function loadTransactions() {
  ipcRenderer.send('load-manageTransactions');
}

function loadCategories() {
  ipcRenderer.send('load-manageCategories');
}
