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


exports.getBalances = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT  date_format(be.entry_date, '%Y-%m-%d') as date, be.checking, be.savings,
                      be.401K as fouronek, be.ira, be.hsa, be.other_investments, be.loans,
                      be.credit_cards, be.total
              FROM    balance_entries be
              ORDER BY entry_date`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }
      var balance_entries = [];

      rows.forEach(function(row) {
        let balance_entry = {
          date: row.date,
          checking: row.checking,
          savings: row.savings,
          fouronek: row.fouronek,
          ira: row.ira,
          hsa: row.hsa,
          other_investments: row.other_investments,
          loans: row.loans,
          credit_cards: row.credit_cards,
          total: row.total
        };
        balance_entries.push(balance_entry);
      });

      resolve(balance_entries);
    });
  });
}


exports.addEntry = function(date, checking, savings, fook, ira, hsa, oi, loans, cc, total) {
  return new Promise(function(resolve, reject) {
    $query = `insert into balance_entries(entry_date, checking, savings, 401k,
                ira, hsa, other_investments, loans, credit_cards, total)
              values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query($query, [date, checking, savings, fook, ira, hsa, oi, loans, cc, total],
      function(err, rows, fields) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}
