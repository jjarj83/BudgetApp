const { ipcRenderer } = require('electron')
const Chart = require('chart.js')

window.addEventListener('load', (event) => {
  //console.log(ipcRenderer.remote.getGlobal('categories'));

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

  loadSpendingPiChart(connection);
  loadSpendingLineChart(connection);
  loadBalancesGraph(connection);
  //loadSavingsRate(connection);
});


function loadSpendingPiChart(connection) {
  $query = `SELECT c.id, c.name, c.color, s.amount
            FROM categories c, stats s
            WHERE c.parent_category_id is null
                  and c.id = s.category_id
                  and s.stat_year = 2021 and s.stat_month = 4`

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

    var ctx = document.getElementById('spending-chart');
    var spendingChart = new Chart(ctx, {
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
    var spending = [];

    rows.forEach(function(row) {
      var label = row.stat_month + '/' + row.stat_year;
      labels.push(label);
      spending.push(row.amount);
    });

    labels = labels.reverse();
    spending = spending.reverse();

    var ctx = document.getElementById('spending-graph');
    var spendingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Spending By Month',
            data: spending,
            tension: 0.1,
            borderColor: 'rgb(200, 165, 161)',
            backgroundColor: 'rgb(247, 186, 189)',
          },
          {
            label: 'Income By Month',
            data: [3800, 3800, 3800, 3800],
            tension: 0.1,
            borderColor: 'rgb(120, 194, 173)',
            backgroundColor: 'rgb(167, 215, 201)',
          }
        ]
      }
    });
  });
}


function loadBalancesGraph(connection) {
  $query =  `SELECT DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, total
            FROM balance_entries
            WHERE entry_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            ORDER BY entry_date`;

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var labels = [];
    var data = [];

    rows.forEach(function(row) {
      labels.push(row.entry_date);
      data.push(row.total);
    });

    var ctx = document.getElementById('balance-graph');
    var spendingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Account Balances',
            data: data,
            tension: 0.1,
            //borderColor: 'rgb(120, 194, 173)',
            fill: {
                target: 'origin',
                above: 'rgb(167, 215, 201)',
                below: 'rgb(247, 186, 189)'
            }
          }
        ]
      }
    });
  });
}


function loadSavingsRate(connection) {
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
    loadRetirement(connection, spending);
  });
}

function loadRetirement(connection, spending) {
  var age = 23;

  $query = `SELECT 401k as fouronek, ira
            FROM balance_entries
            ORDER BY entry_date desc
            LIMIT 1`

  connection.query($query, function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    var investments = Number(rows[0].fouronek) + Number(rows[0].ira);
    console.log(age, spending);
  });
}
