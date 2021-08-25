const { ipcRenderer } = require('electron')
const portfolioFunctions = require('../Server_Functions/portfolio_functions.js')

window.addEventListener('load', (event) => {
  let tickers = portfolioFunctions.getTickers().then(
    function (response) {
      tickers = response;
    },
    function (error) {
      console.log(error);
    }
  );

  document.getElementById('save-trade').addEventListener('click', function() { addTrade(tickers); });
});

function addTrade(tickers) {
  document.getElementById('buy-sell').classList.remove("is-invalid");
  document.getElementById('ticker-symbol').classList.remove("is-invalid");
  document.getElementById('share-count').classList.remove("is-invalid");
  document.getElementById('sale-price').classList.remove("is-invalid");

  var transaction_type = document.getElementById('buy-sell').value;
  var ticker = document.getElementById('ticker-symbol').value;
  var shares = document.getElementById('share-count').value;
  var salePrice = document.getElementById('sale-price').value;

  if (validateEntry(transaction_type, ticker, shares, salePrice)) {
    if (transaction_type === 'sell') {
       shares = -shares;
    }

    if (tickers.includes(ticker)) {
      portfolioFunctions.updatePosition(ticker, shares, salePrice).then(
        function (response) {
          ipcRenderer.send('close-addTrade');
        },
        function (error) {
          console.log(error);
        }
      );

    } else {
      portfolioFunctions.newPosition(ticker, shares, salePrice).then(
        function (response) {
          ipcRenderer.send('close-addTrade');
        },
        function (error) {
          console.log(error);
        }
      );
    }
  }

}

function validateEntry(transaction_type, ticker, shares, salePrice) {
  var errors = 0;

  if (transaction_type === "") {
    errors++;
    document.getElementById("buy-sell").classList.add("is-invalid");
  }

  fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=a33d6a7f9b717b8524e76aa0418eb34b`)
    .then(function(response) {
      response.json().then(function(data) {
        if (!data[0]) {
          document.getElementById("ticker-symbol").classList.add("is-invalid");
          errors++;
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      errors++;
    });

  if (shares === "") {
    errors++;
    document.getElementById("share-count").classList.add("is-invalid");
  } else if (parseFloat(shares) < 0) {
    errors++;
    document.getElementById("share-count").classList.add("is-invalid");
  }

  if (salePrice === "") {
    errors++;
    document.getElementById("salePrice").classList.add("is-invalid");
  } else if (parseFloat(salePrice) < 0) {
    errors++;
    document.getElementById("salePrice").classList.add("is-invalid");
  }

  console.log(errors);

  if (errors > 0) { return false; }
  return true;
}
