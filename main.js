const { app, BrowserWindow, ipcMain } = require('electron')


app.on('ready', function() {
  let mainWindow;
  let editCategoryWindow;

  mainWindow= new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1400,
    height: 800,
  })

  mainWindow.loadFile('manage_categories.html')
  mainWindow.openDevTools()

  ipcMain.on('load-editCategory', function() {
    editCategoryWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 800,
      height: 600,
    })

    editCategoryWindow.loadFile('edit_category.html')
  })

  ipcMain.on('close-editCategory', function() {
    editCategoryWindow.close();
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
