const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createSplashWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'RadioBud',
    titleBarStyle: 'hiddenInset',
    resizable: false,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.center();
  mainWindow.loadFile('splash.html');
  
  mainWindow.on('blur', () => {
    mainWindow.setWindowButtonVisibility(false);
  });
  
  mainWindow.on('focus', () => {
    mainWindow.setWindowButtonVisibility(true);
  });

  const startTime = Date.now();
  let splashShown = false;

  mainWindow.webContents.once('did-finish-load', () => {
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 500) {
      splashShown = true;
      setTimeout(() => {
        mainWindow.webContents.executeJavaScript(`
          document.body.classList.add('fade-out');
        `);
        
        setTimeout(() => {
          loadMainApp();
        }, 500);
      }, 2000);
    } else {
      loadMainApp();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadMainApp() {
  mainWindow.setSize(300, 470);
  mainWindow.center();
  mainWindow.loadFile('index.html');

  // Don't auto-resize on load to avoid jump
  // mainWindow.webContents.once('did-finish-load', () => {
  //   updateWindowHeight();
  // });
}

function updateWindowHeight() {
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      document.body.scrollHeight
    `).then((height) => {
      const boundedHeight = Math.min(Math.max(height, 100), 800);
      mainWindow.setContentSize(300, boundedHeight);
      // Don't center - keep window position
    });
  }
}

app.on('ready', createSplashWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createSplashWindow();
  }
});

ipcMain.on('resize-window', () => {
  updateWindowHeight();
});
