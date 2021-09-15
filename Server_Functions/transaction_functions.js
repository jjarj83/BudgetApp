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

exports.getTransactions = function(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    $query = `SELECT  t.id, date_format(t.date, '%m-%d-%Y') as date, t.name, t.amount, c1.name as category, c2.name as parent_category
              FROM    transactions t, categories c1 LEFT OUTER JOIN categories c2 ON c1.parent_category_id = c2.id
              WHERE   t.category_id = c1.id
	                    and t.date >= '${startDate}' and t.date <= '${endDate}'
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


exports.removeIncome = function(incomeId) {
  return new Promise(function (resolve, reject) {
    $query = `DELETE FROM incomes WHERE id = ?`;

    connection.query($query, [incomeId], function(err) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}


exports.getIncomes = function(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    $query = `SELECT i.id, date_format(i.date, '%m-%d-%Y') as date, i.name, i.amount
              FROM incomes i
              WHERE i.date >= '${startDate}' and i.date <= '${endDate}'
              ORDER BY i.date`,

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      var incomes = [];
      rows.forEach(function(row) {
        let income = {
          id: row.id,
          date: row.date,
          name: row.name,
          amount: row.amount,
        };
        incomes.push(income);
      });

      resolve(incomes);
    });
  });
}


exports.bulkAddIncomes = function(incomesArray) {
  return new Promise(function (resolve, reject) {
    $query = `INSERT INTO incomes(name, date, amount)
              VALUES ?`;

    connection.query($query, [incomesArray], function(err) {
      if (err) {
        reject(err);
      }
      resolve("Success");
    });
  });
}


exports.getTransaction = function(id) {
  return new Promise(function (resolve, reject) {
    console.log(id);

    $query = `SELECT  t.id, date_format(t.date, '%m-%d-%Y') as date, t.name, t.amount, t.category_id, c.parent_category_id
              FROM    transactions t join categories c on t.category_id = c.id
              WHERE   t.id = ?`

    connection.query($query, [id], function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      console.log(rows);
      var pid = rows[0].parent_category_id;
      var cid = rows[0].category_id;

      if (!rows[0].parent_category_id) {
        pid = rows[0].category_id;
        cid = rows[0].parent_category_id;
      }

      var date = new Date(rows[0].date).toLocaleDateString('fr-CA');

      let transaction = {
        id: id,
        date: date,
        name: rows[0].name,
        amount: rows[0].amount,
        pid: pid,
        cid: cid
      };

      resolve(transaction);
    });
  });
}


exports.getIncome = function(id) {
  return new Promise(function (resolve, reject) {
    console.log(id);

    $query = `SELECT  i.id, date_format(i.date, '%m-%d-%Y') as date, i.amount
              FROM    incomes i
              WHERE   i.id = ?`

    connection.query($query, [id], function(err, rows, fields) {
      if (err) {
        reject(err);
      }
      console.log(rows);

      var date = new Date(rows[0].date).toLocaleDateString('fr-CA');

      let transaction = {
        id: id,
        date: date,
        amount: rows[0].amount,
      };

      resolve(transaction);
    });
  });
}


exports.editTransaction = function(id, name, date, amount, categoryId) {
  return new Promise(function (resolve, reject) {
    $query = `CALL edit_transaction(?, ?, ?, ?, ?)`

    connection.query($query, [id, name, date, amount, categoryId], function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      resolve("Success");
    });

  });
}


exports.editIncome = function(id, date, amount) {
  return new Promise(function (resolve, reject) {
    $query = `UPDATE incomes
              SET date = ?, amount = ?
              WHERE id = ?`

    connection.query($query, [date, amount, id], function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      resolve("Success");
    });

  });
}
