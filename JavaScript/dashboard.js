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
      loadRetirementInfo(savingsStats);
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
          data: lineGraphInfo.income,
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

  html = '$' + Number(avgExpenses.toFixed(2)).toLocaleString();
  document.getElementById('expenses').innerHTML = html;

  html = '$' + Number(avgIncome.toFixed(2)).toLocaleString();
  document.getElementById('income').innerHTML = html;

}


function loadRetirementInfo(savingsStats) {
  var avgExpenses = savingsStats.expenses / 7;
  var goal = avgExpenses * 12 * 25;
  var html = "$" + Number(goal.toFixed(2)).toLocaleString();
  document.getElementById('retirement-goal').innerHTML = html;

  let retirementBalance = dashboardFunctions.getRetirementBalances().then(
    function (response) {

      retirementBalance = response;
      console.log(retirementBalance);
      var html = "$" + Number(retirementBalance.toFixed(2)).toLocaleString();
      document.getElementById('retirement-savings').innerHTML = html;
      var pct = ((retirementBalance / goal) * 100).toFixed(0);
      console.log(pct);
      document.getElementById('retirement-progress').style.width = `${pct}%`

      calculateAge(goal, retirementBalance);
    },
    function(error) {
      console.log(error);
    }
  );

}


function calculateAge(goal, retirementBalance) {
  var top = Math.log((goal * 0.08 + 25000) / (retirementBalance * 0.08 + 25000));
  var bottom = Math.log(1.08);

  var years = Math.ceil(top / bottom) + 23;
  document.getElementById('retirement-age').innerHTML = years;
}
