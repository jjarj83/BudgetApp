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


//Returns Categories object with stats
exports.getCategories = function () {
  return new Promise(function (resolve, reject) {
    $query = `SELECT c.id, c.name, c.color, c.parent_category_id,
                (select sum(s.amount) from stats s where s.category_id = c.id and s.stat_month = 4 and s.stat_year = 2021) as amount
  	          FROM categories c`;

    connection.query($query, function(err, rows, fields) {
      var parentCategories = {};
      var childCategories = [];

      if (err) {
        reject(err);
      }

      rows.forEach(function(row) {
        if (row.amount === null) { row.amount = 0; }
        if (!row.parent_category_id) {
          let parentCategory = {
            name: row.name,
            color: row.color,
            amount: row.amount,
            children: []
          };
          parentCategories[row.id] = parentCategory;
        }
      });

      rows.forEach(function(row) {
        if (row.amount === null) { row.amount = 0; }
        if (row.parent_category_id) {
          let childCategory = {
            id: row.id,
            name: row.name,
            amount: row.amount,
            pid: row.parent_category_id
          };
          parentCategories[row.parent_category_id].children.push(childCategory);
        }
      });

      //console.log(parentCategories);
      resolve(parentCategories);
    });
  });

}


exports.addCategory = function (name, pid, color) {

  return new Promise(function (resolve, reject) {
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

    $query = `insert into categories (name, parent_category_id, color)
                 values (?, ?, ?);`

    connection.query($query, [name, pid, color], function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      resolve("Success");
    });
  });

}
