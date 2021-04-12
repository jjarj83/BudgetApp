const { ipcRenderer } = require('electron')

document.getElementById('save-category').addEventListener("click", saveCategory)

function saveCategory() {
  ipcRenderer.send('close-editCategory')
}
