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


exports.getCategoriesNoStats = function () {
  return new Promise(function (resolve, reject) {
    $query = `SELECT c.id, c.name, c.parent_category_id
              FROM categories c`;

    connection.query($query, function (err, rows, fields) {
      if (err) {
        reject(err);
      }

      var categories = [];
      rows.forEach(function(row) {
        let category = {
          id: row.id,
          name: row.name,
          pid: row.parent_category_id
        }
        categories.push(category);
      });

      resolve(categories);
    });
  });
}


exports.getCategoriesHash = function() {
  return new Promise(function (resolve, reject) {
    $query = `SELECT c1.id, c1.name, c1.parent_category_id, c2.name as parent_name
              FROM categories c1 LEFT OUTER JOIN categories c2 ON c1.parent_category_id = c2.id`;

    connection.query($query, function (err, rows, fields) {
      if (err) {
        reject(err);
      }

      var categoriesHash = {};
      rows.forEach(function(row) {
        if (!row.parent_category_id) {
          let parentCategory = {
            id: row.id,
            children: {}
          }
          categoriesHash[row.name] = parentCategory;
        }
      });

      rows.forEach(function(row) {
        if (row.parent_category_id) {
          categoriesHash[row.parent_name].children[row.name] = row.id;
        }
      })

      resolve(categoriesHash);
    });
  })
}


exports.addCategory = function (name, pid, color) {
  return new Promise(function (resolve, reject) {
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

/*
function getChildren(pid) = {
  return new Promise(function (resolve, reject) {

  });
}
*/
