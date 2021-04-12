const { ipcRenderer } = require('electron')

document.getElementById('add-category-button').addEventListener("click", addCategory)

function addCategory() {
  ipcRenderer.send('load-editCategory')
}
