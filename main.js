const { app, BrowserWindow, ipcMain } = require('electron')

let manageCategoriesWindow;
let editCategoryWindow;
let manageTransactionsWindow;
let editTransactionWindow;
let dashboardWindow;

app.on('ready', function() {
  loadDashboard();

  ipcMain.on('loadDashboard', function(event, pid) {
    loadDashboard();
  });

  ipcMain.on('load-manageTransactions', function(event, pid) {
    dashboardWindow.hide();

    manageTransactionsWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 2100,
      height: 1200,
    });

    manageTransactionsWindow.loadFile('Transactions\\manage_transactions.html');
    manageTransactionsWindow.openDevTools();
    dashboardWindow.close();
  });


  ipcMain.on('load-manageCategories', function(event, pid) {
    dashboardWindow.hide();
    manageCategoriesWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 2100,
      height: 1200,
    });

    manageCategoriesWindow.loadFile('Categories\\manage_categories.html');
    manageCategoriesWindow.openDevTools();
    dashboardWindow.close();
  })

  ipcMain.on('load-editTransaction', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    editTransactionWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 1400,
      height: 800,
      parent: manageTransactionsWindow,
      modal: true,
    });

    editTransactionWindow.loadFile('Transactions\\edit_transaction.html');
    editTransactionWindow.openDevTools();
  })

  ipcMain.on('close-editTransaction', function() {
    editTransactionWindow.close();
    manageTransactionsWindow.reload();
  })


  ipcMain.on('load-editCategory', function(event, pid) {
    //will have to make this a seperate function so I can have different events triggering it
    editCategoryWindow = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      width: 1400,
      height: 800,
      parent: manageCategoriesWindow,
      modal: true,
    });

    editCategoryWindow.loadFile('Categories\\edit_category.html', {query: {pid: pid}});
    editCategoryWindow.openDevTools();
  })

  ipcMain.on('close-editCategory', function() {
    editCategoryWindow.close();
    manageCategoriesWindow.reload();
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

function loadDashboard() {
  dashboardWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 2100,
    height: 1200,
  });

  dashboardWindow.loadFile('Dashboard\\dashboard.html');
  dashboardWindow.openDevTools();
}
