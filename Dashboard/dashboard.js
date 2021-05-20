const { ipcRenderer } = require('electron')
const Chart = require('chart.js')

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

  loadSpendingPiChart(connection);
  loadSpendingLineChart(connection);
  loadSavingsRate(connection);
});

function loadSpendingPiChart(connection) {
  $query = `SELECT c.id, c.name, c.color, s.amount
            FROM categories c, stats s
            WHERE c.parent_category_id is null
                  and c.id = s.category_id
                  and s.stat_month = 5
                  and s.stat_year = 2021`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var labels = [];
    var data = [];
    var colors = [];

    rows.forEach(function(row) {
      labels.push(row.name);
      data.push(row.amount);
      colors.push(row.color);
    });

    var spc = document.getElementById('spending-chart');
    var spendingChart = new Chart(spc, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors
          }
        ]
      }
    });
  });
}

function loadSpendingLineChart(connection) {
  $query = `SELECT stat_year, stat_month, sum(amount) as amount
            FROM stats
            GROUP BY stat_year, stat_month
            ORDER BY stat_year desc, stat_month desc
            LIMIT 6`

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var labels = [];
    var data = [];

    rows.forEach(function(row) {
      var label = row.stat_month + '/' + row.stat_year;
      labels.push(label);
      data.push(row.amount);
    });

    labels = labels.reverse();
    data = data.reverse();

    var spc = document.getElementById('spending-graph');
    var spendingChart = new Chart(spc, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Spending By Month',
            data: data,
            tension: 0.1,
            borderColor: 'rgb(75, 192, 192)'
          }
        ]
      }
    });
  });
}

function loadSavingsRate (connection) {
  $query = `SELECT sum(amount) as amount
            FROM stats
            WHERE stat_month = 5 and stat_year = 2021`

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var spending;
    rows.forEach(function(row) {
      spending = row.amount;
    });

    var percent = 100 - ((spending / 2000) * 100);
    var html = '<h1>' + percent.toFixed(2) + '%</h1>';

    document.getElementById('savings-rate').innerHTML += html;
  });
}
