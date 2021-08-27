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

exports.getTransactions = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT  t.id, date_format(t.date, '%m-%d-%Y') as date, t.name, t.amount, c1.name as category, c2.name as parent_category
              FROM    transactions t, categories c1 LEFT OUTER JOIN categories c2 ON c1.parent_category_id = c2.id
              WHERE   t.category_id = c1.id
	                    and t.date >= '2021-01-01'
              ORDER BY t.date`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      var transactions = [];
      rows.forEach(function(row) {
        let transaction = {
          id: row.id,
          date: row.date,
          name: row.name,
          amount: row.amount,
          category: row.category,
          parentCategory: row.parent_category
        };
        transactions.push(transaction);
      });

      resolve(transactions);
    });
  });
}


exports.addTransaction = function(name, date, amount, category) {

  return new Promise(function (resolve, reject) {
    $query = `call add_transaction(?, ?, ?, ?)`;

    connection.query($query, [name, date, amount, category],
      function(err, rows, fields) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}


exports.bulkAddTransactions = function(transactionsArray) {
  return new Promise(function (resolve, reject) {
    $query = `INSERT INTO transactions(name, date, amount, category_id)
              VALUES ?`;

    connection.query($query, [transactionsArray], function(err) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}


exports.removeTransaction = function(transactionId) {
  return new Promise(function (resolve, reject) {
    $query = `DELETE FROM transactions WHERE id = ?`;

    connection.query($query, [transactionId], function(err) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}
