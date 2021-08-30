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
    $query = `SELECT c.id, c.name, c.color, sum(s.amount) as amount
              FROM categories c, stats s
              WHERE c.parent_category_id is null
                    and c.id = s.category_id
                    and s.stat_year = 2021 and s.stat_month > 1
              GROUP BY c.id, c.name, c.color`;

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
    $query = `SELECT stat_year, stat_month, sum(amount) as amount
              FROM stats
              GROUP BY stat_year, stat_month
              ORDER BY stat_year desc, stat_month desc
              LIMIT 6`;

    connection.query($query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      let lineGraph = {
        labels: [],
        spending: []
      };

      rows.forEach(function(row){
        var label = row.stat_month + '/' + row.stat_year;
        lineGraph.labels.push(label);
        lineGraph.spending.push(row.amount);
      });
      lineGraph.labels = lineGraph.labels.reverse();
      lineGraph.spending = lineGraph.spending.reverse();

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
              FROM stats
              WHERE stat_year = 2021 and stat_month < 8
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
