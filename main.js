const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    minHeight: 100,
    maxHeight: 800,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.on('did-finish-load', () => {
    updateWindowHeight();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function updateWindowHeight() {
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      document.body.scrollHeight
    `).then((height) => {
      const boundedHeight = Math.min(Math.max(height, 100), 800);
      mainWindow.setContentSize(300, boundedHeight);
    });
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('resize-window', () => {
  updateWindowHeight();
});
