const { ipcRenderer } = require('electron')
const Chart = require('chart.js')
const dashboardFunctions = require('../Server_Functions/dashboard_functions.js')

window.addEventListener('load', (event) => {
  //console.log(ipcRenderer.remote.getGlobal('categories'));

  var $ = require('jquery');

  $(function() {
    $("#sidebar").load("sidebar.html");
  });

  let piChartInfo = dashboardFunctions.getSpendingPiChart().then(
    function (response) {
      piChartInfo = response;
      console.log(piChartInfo);
      loadSpendingPiChart(piChartInfo);
    },
    function (error) {
      console.log(error);
    }
  );

  let lineGraphInfo = dashboardFunctions.getSpendingLineGraph().then(
    function (response) {
      lineGraphInfo = response;
      console.log(lineGraphInfo);
      loadSpendingLineGraph(lineGraphInfo)
    },
    function (error) {
      console.log(error);
    }
  );

  let balancesInfo = dashboardFunctions.getBalanceStats().then(
    function (response) {
      balancesInfo = response;
      console.log(balancesInfo);
      loadBalancesGraph(balancesInfo);
    },
    function(error) {
      console.log(error);
    }
  );

  let savingsStats = dashboardFunctions.getSavingsStats().then(
    function (response) {
      savingsStats = response;
      console.log(savingsStats);
      loadSavingsRate(savingsStats);
    },
    function(error) {
      console.log(error);
    }
  );

});


function loadSpendingPiChart(piChartInfo) {

  var ctx = document.getElementById('spending-chart');
  var spendingChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: piChartInfo.labels,
      datasets: [
        {
          data: piChartInfo.data,
          backgroundColor: piChartInfo.colors
        }
      ]
    }
  });

}


function loadSpendingLineGraph(lineGraphInfo) {

  var ctx = document.getElementById('spending-graph');
  var spendingChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: lineGraphInfo.labels,
      datasets: [
        {
          label: 'Spending By Month',
          data: lineGraphInfo.spending,
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

}


function loadBalancesGraph(balancesInfo) {

  var ctx = document.getElementById('balance-graph');
  var spendingChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: balancesInfo.labels,
      datasets: [
        {
          label: 'Account Balances',
          data: balancesInfo.data,
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

}


function loadSavingsRate(savingsStats) {

  var avgExpenses = savingsStats.expenses / 7;
  var avgIncome = savingsStats.income / 7;

  var percent = 100 - ((avgExpenses / avgIncome) * 100);
  var html = percent.toFixed(2) + '%';

  document.getElementById('savings-rate').innerHTML = html;

  html = '$' + avgExpenses.toFixed(2);
  document.getElementById('expenses').innerHTML = html;

  html = '$' + avgIncome.toFixed(2);
  document.getElementById('income').innerHTML = html;

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
