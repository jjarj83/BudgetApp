const { app, BrowserWindow, ipcMain } = require('electron')

app.on('ready', function() {
  let mainWindow;
  let editCategoryWindow;

  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1400,
    height: 800,
  })

  mainWindow.loadFile('Categories\\manage_categories.html')
  mainWindow.openDevTools()

  mainWindow.on('closed', function() {
    console.log("Close");
    app.quit();
  })

  ipcMain.on('load-editCategory', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    editCategoryWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 800,
      height: 600,
      parent: mainWindow,
      modal: true,
    })

    editCategoryWindow.loadFile('Categories\\edit_category.html', {query: {pid: pid}});
    editCategoryWindow.openDevTools();
  })

  ipcMain.on('close-editCategory', function() {
    editCategoryWindow.close();
    mainWindow.reload();
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
