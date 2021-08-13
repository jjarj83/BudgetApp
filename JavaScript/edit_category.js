const { ipcRenderer } = require('electron')
const querystring = require('querystring')
const categoryFunctions = require('../Server/category_functions.js');

let query = querystring.parse(global.location.search);
let pid = query['?pid'];

if (pid === '0') {
  document.getElementById('category-color').style.display = "block";
  document.getElementById('category-color').addEventListener("change", function() { changeColor(); });
  document.getElementById('category-color-label').style.display = "block";
}

document.getElementById('save-category').addEventListener("click", function() { addCategory(pid); });

function addCategory() {
  var name = document.getElementById('category-name').value;
  if (name === "") {
    document.getElementById("category-name").classList.add("is-invalid");
  } else {
    if (pid === '0') {
      var color = document.getElementById('category-color').value;
      pid = null;
    }

    categoryFunctions.addCategory(name, pid, color).then(
      function (response) {
        console.log(response);
        ipcRenderer.send('close-editCategory')
      },
      function (error) {
        console.log(error);
      }
    );
  }
}

function changeColor() {
  document.getElementById('category-color').style.backgroundColor = document.getElementById('category-color').value;
}
