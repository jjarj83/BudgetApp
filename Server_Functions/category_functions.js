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
		            (SELECT sum(t.amount) as amount FROM transactions t WHERE (t.category_id = c.id or t.category_id in
			               (SELECT id FROM categories WHERE parent_category_id = c.id)) and t.date >= '2021-09-01') as amount
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


exports.getParentCategoriesNoStats = function () {
  return new Promise(function (resolve, reject) {
    $query = `SELECT c.id, c.name
              FROM categories c
              WHERE c.parent_category_id is NULL
              ORDER BY c.name`;

    connection.query($query, function (err, rows, fields) {
      if (err) {
        reject(err);
      }

      var categories = [];
      rows.forEach(function(row) {
        let category = {
          id: row.id,
          name: row.name,
        }
        categories.push(category);
      });

      resolve(categories);
    });
  });
}


exports.getSubCategoriesNoStats = function (pid) {
  return new Promise(function (resolve, reject) {
    $query = `SELECT c.id, c.name
              FROM categories c
              WHERE c.parent_category_id = ?
              ORDER BY c.name`;

    connection.query($query, [pid], function (err, rows, fields) {
      if (err) {
        reject(err);
      }

      var categories = [];
      rows.forEach(function(row) {
        let category = {
          id: row.id,
          name: row.name,
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
