const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('No updates available');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available');
  }
});

autoUpdater.on('error', (err) => {
  console.error('Update error:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progress) => {
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progress);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

function createSplashWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'RadioBud',
    titleBarStyle: 'hiddenInset',
    resizable: true,
    minWidth: 400,
    minHeight: 300,
    maxWidth: 1200,
    maxHeight: 1000,
    alwaysOnTop: false,
    transparent: true,
    vibrancy: 'sidebar',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
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
  mainWindow.setSize(400, 500);
  mainWindow.center();
  mainWindow.loadFile('index.html');
  
  // Check for updates after main app loads
  mainWindow.webContents.once('did-finish-load', () => {
    // Only check for updates in production builds
    if (!app.isPackaged) {
      console.log('Development mode - skipping update check');
      return;
    }
    
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.error('Failed to check for updates:', err);
      });
    }, 3000);
  });
}

function updateWindowHeight() {
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      document.body.scrollHeight
    `).then((height) => {
      const boundedHeight = Math.min(Math.max(height, 100), 800);
      mainWindow.setContentSize(680, boundedHeight);
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

// IPC handlers for updates
ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Failed to check for updates:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', err.message);
    }
  });
});

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate().catch(err => {
    console.error('Failed to download update:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', err.message);
    }
  });
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});
