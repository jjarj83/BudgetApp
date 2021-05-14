const { ipcRenderer } = require('electron')
const querystring = require('querystring')
const mysql = require('mysql');

let query = querystring.parse(global.location.search);
let pid = query['?pid'];


if (pid === '0') {
  document.getElementById('category-color').style.display = "block";
}

document.getElementById('save-category').addEventListener("click", function() { addCategory(pid)});

function addCategory() {
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


  var name = document.getElementById('category-name').value;

  let $query;
  if (pid === '0') {
    var color = document.getElementById('category-color').value;
    pid = null;
  }

  //console.log(name, color);
  $query = `insert into categories (name, parent_category_id, color)
             values (?, ?, ?);`

  connection.query($query, [name, pid, color], function(err, rows, fields) {
    if (err) {
      console.log("An error occured performing the query.");
      console.log(err);
      return;
    }

    ipcRenderer.send('close-editCategory')
  });
}