const { app, BrowserWindow, ipcMain } = require('electron');
const mysql = require('mysql');

let mainWindow;
let childWindow;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 2100,
    height: 1200,
  });

  mainWindow.loadFile('Layouts/dashboard.html');
  mainWindow.openDevTools();

  ipcMain.on('load-editTransaction', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    childWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 1400,
      height: 800,
      parent: mainWindow,
      modal: true,
    });

    childWindow.loadFile('Transactions/edit_transaction.html');
    childWindow.openDevTools();
  })

  ipcMain.on('reload-transaction', function() {
    mainWindow.reload();
  })


  ipcMain.on('load-editCategory', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    childWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 1400,
      height: 800,
      parent: mainWindow,
      modal: true,
    });

    childWindow.loadFile('Layouts/edit_category.html', {query: {pid: pid}});
    childWindow.openDevTools();
  })

  ipcMain.on('close-editCategory', function() {
    childWindow.close();
    mainWindow.reload();
  })

  ipcMain.on('load-editEntry', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    childWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 1400,
      height: 800,
      parent: mainWindow,
      modal: true,
    });

    childWindow.loadFile('Layouts/edit_balance_entry.html');
    childWindow.openDevTools();
  })

  ipcMain.on('close-editEntry', function() {
    childWindow.close();
    mainWindow.reload();
  })

  ipcMain.on('load-addTrade', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    childWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 1400,
      height: 800,
      parent: mainWindow,
      modal: true,
    });

    childWindow.loadFile('Layouts/add_trade.html');
    childWindow.openDevTools();
  })

  ipcMain.on('close-addTrade', function() {
    childWindow.close();
    mainWindow.reload();
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
