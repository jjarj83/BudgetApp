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


exports.getSpendingPiChart = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT c.id, c.name, c.color, sum(t.amount) as amount
              FROM categories c, transactions t
              WHERE c.parent_category_id is null
		            and(t.category_id = c.id or t.category_id in (SELECT id FROM categories WHERE parent_category_id = c.id))
		            and t.date >= '2021-0-01'
              GROUP BY c.id, c.name, c.color;`;

      connection.query($query, function(err, rows, fields) {
        if (err) {
          reject(err);
        }

        let piChart = {
          labels: [],
          data: [],
          colors: []
        };

        rows.forEach(function(row) {
          piChart.labels.push(row.name);
          piChart.data.push(row.amount);
          piChart.colors.push(row.color);
        });

        resolve(piChart);
      });
  });
}


exports.getSpendingLineGraph = function() {
  return new Promise(function (resolve, reject) {
    $query = `(SELECT 'transaction' as label, year(t.date) as year, month(t.date) as month, sum(t.amount) as amount
              FROM transactions t
              GROUP BY year(t.date), month(t.date)
              ORDER BY year(t.date) desc, month(t.date) desc
              LIMIT 6)
              UNION
              (SELECT 'income' as label, year(i.date) as year, month(i.date) as month, sum(i.amount) as amount
              FROM incomes i
              GROUP BY year(i.date), month(i.date)
              ORDER BY year(i.date) desc, month(i.date) desc
              LIMIT 6)`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      let lineGraph = {
        labels: [],
        spending: [],
        income: []
      };

      rows.forEach(function(row){
        if (row.label === 'transaction') {
          var label = row.month + '/' + row.year;
          lineGraph.labels.push(label);
          lineGraph.spending.push(row.amount);
        } else {
          lineGraph.income.push(row.amount);
        }
      });
      lineGraph.labels = lineGraph.labels.reverse();
      lineGraph.spending = lineGraph.spending.reverse();
      lineGraph.income = lineGraph.income.reverse();

      resolve(lineGraph);
    });
  });
}


exports.getBalanceStats = function() {
  return new Promise(function (resolve, reject) {
    $query =  `SELECT DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, total
              FROM balance_entries
              WHERE entry_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
              ORDER BY entry_date`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject (err);
      }

      let balancesGraph = {
        labels: [],
        data: []
      };

      rows.forEach(function(row) {
        balancesGraph.labels.push(row.entry_date);
        balancesGraph.data.push(row.total);
      });

      resolve(balancesGraph);
    });
  });
}


exports.getSavingsStats = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT 'expenses' as name, sum(amount) as amount
              FROM transactions
              WHERE date >= '2021-01-01' and date < '2021-08-01'
              UNION
              SELECT 'income' as name, sum(amount) as amount
              FROM incomes
              WHERE date >= '2021-01-01' and date < '2021-08-01'`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      let savingsStats = {
        expenses: rows[0].amount,
        income: rows[1].amount
      };

      resolve(savingsStats);
    });

  });
}


exports.getRetirementBalances = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT 401k as fourOneK, ira
              FROM balance_entries
              ORDER BY entry_date desc
              LIMIT 1`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      let retirementBalance = Number(rows[0].fourOneK) + Number(rows[0].ira);

      resolve(retirementBalance);
    });
  });
}
