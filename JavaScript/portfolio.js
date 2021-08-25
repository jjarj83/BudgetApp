const { ipcRenderer } = require('electron')
const portfolioFunctions = require('../Server_Functions/portfolio_functions.js')

window.addEventListener('load', (event) => {
  var $ = require('jquery');

  $(function() {
    $("#sidebar").load("sidebar.html");
  });

  let positions = portfolioFunctions.getPositions().then(
    function (response) {
      positions = response;
      positions.forEach(function(position) {
        getPrice(position);
      });
    },
    function (error) {
      console.log(error);
    }
  );

  document.getElementById('new-trade').addEventListener('click', function() { addTrade(); });
});


function getPrice(position) {

  fetch(`https://financialmodelingprep.com/api/v3/quote/${position.ticker}?apikey=a33d6a7f9b717b8524e76aa0418eb34b`)
    .then(function(response) {
      response.json().then(function(data) {
        console.log(data);
        if (!data[0].price) {
          getPrice(position);
        }
        addRow(position, data[0].price);
      });
    })
    .catch(function(err) {
      console.log("Error:", err);
    });

}


function addRow(position, price) {
  var balance = position.shares * price;
  var growth = balance - (position.avg_cost * position.shares);
  var pctChange = ((price - position.avg_cost) / position.avg_cost) * 100;

  var table = document.getElementById('table-body');
  var row = table.insertRow();
  row.insertCell().innerHTML = position.ticker;
  row.insertCell().innerHTML = position.shares.toFixed(2);
  row.insertCell().innerHTML = balance.toFixed(2);
  row.insertCell().innerHTML = price.toFixed(2);
  row.insertCell().innerHTML = position.avg_cost.toFixed(2);
  row.insertCell().innerHTML = growth.toFixed(2);
  row.insertCell().innerHTML = pctChange.toFixed(2);
  row.insertCell();
}


function addTrade() {
  ipcRenderer.send('load-addTrade', 0);
}
