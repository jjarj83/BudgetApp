const { ipcRenderer } = require('electron')
const mysql = require('mysql');

//document.getElementById('save-transaction').addEventListener("click", function() { addTransaction(); });

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

  document.getElementById('save-entry').addEventListener('click', function() { addEntry(connection); });
});

function addEntry(connection) {
  console.log("Here");

  var date = document.getElementById('entry-date').value;
  var checking = document.getElementById('checking-amount').value;
  var savings = document.getElementById('savings-amount').value;
  var fook = document.getElementById('401k-amount').value;
  var ira = document.getElementById('ira-amount').value;
  var hsa = document.getElementById('hsa-amount').value;
  var oi = document.getElementById('oi-amount').value;
  var loans = document.getElementById('loan-amount').value;
  var cc = document.getElementById('cc-amount').value;

  if (validateEntry(date, checking, savings, fook, ira, hsa, oi, loans, cc)) {
    var total = Number(checking) + Number(savings) + Number(fook) + Number(ira)
          + Number(hsa) + Number(oi) - Number(loans) - Number(cc);

    $query = `insert into balance_entries(entry_date, checking, savings, 401k,
                ira, hsa, other_investments, loans, credit_cards, total)
              values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query($query, [date, checking, savings, fook, ira, hsa, oi, loans, cc, total],
      function(err, rows, fields) {
      if (err) {
        console.log("An error occured performing the query.");
        console.log(err);
        return;
      }

      ipcRenderer.send('close-editEntry')
    });
  }
}

function validateEntry(date, checking, savings, fook, ira, hsa, oi, loans, cc) {
  var errors = 0;

  if (date === "") {
    errors++;
    document.getElementById("entry-date").classList.add("is-invalid");
  }

  if (checking === "") {
    errors++;
    document.getElementById("checking-amount").classList.add("is-invalid");
  }

  if (savings === "") {
    errors++;
    document.getElementById("savings-amount").classList.add("is-invalid");
  }

  if (fook === "") {
    errors++;
    document.getElementById("401k-amount").classList.add("is-invalid");
  }

  if (ira === "") {
    errors++;
    document.getElementById("ira-amount").classList.add("is-invalid");
  }

  if (hsa === "") {
    errors++;
    document.getElementById("hsa-amount").classList.add("is-invalid");
  }

  if (oi === "") {
    errors++;
    document.getElementById("oi-amount").classList.add("is-invalid");
  }

  if (loans === "") {
    errors++;
    document.getElementById("loan-amount").classList.add("is-invalid");
  }

  if (cc === "") {
    errors++;
    document.getElementById("cc-amount").classList.add("is-invalid");
  }

  console.log(errors);

  if (errors > 0) { return false; }
  return true;
}
