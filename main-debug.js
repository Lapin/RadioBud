const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
const debugLog = [];

function log(message) {
  const timestamp = Date.now();
  const logEntry = `[${timestamp}] ${message}`;
  debugLog.push(logEntry);
  console.log(logEntry);
}

function createSplashWindow() {
  log('=== CREATING SPLASH WINDOW ===');
  
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  log(`Window created - frame: default(true), size: 300x200`);
  log(`Window isVisible: ${mainWindow.isVisible()}`);
  log(`Window isFocused: ${mainWindow.isFocused()}`);

  mainWindow.loadFile('splash.html');
  log('Loading splash.html...');
  
  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.on('did-start-loading', () => {
    log('splash.html - did-start-loading');
  });

  mainWindow.webContents.once('did-finish-load', () => {
    log('splash.html - did-finish-load');
    log(`Window isVisible after load: ${mainWindow.isVisible()}`);
    
    setTimeout(() => {
      log('=== STARTING FADE OUT (2000ms elapsed) ===');
      mainWindow.webContents.executeJavaScript(`
        document.body.classList.add('fade-out');
      `);
      log('fade-out class added to body');
      
      setTimeout(() => {
        log('=== LOADING MAIN APP (2500ms elapsed) ===');
        loadMainApp();
      }, 500);
    }, 2000);
  });

  mainWindow.on('closed', () => {
    log('Window closed event');
    mainWindow = null;
  });
}

function loadMainApp() {
  log('loadMainApp() called');
  log(`Current window state - isVisible: ${mainWindow.isVisible()}, size: ${mainWindow.getSize()}`);
  
  mainWindow.setSize(300, 400);
  log(`Window resized to 300x400`);
  
  mainWindow.loadFile('index.html');
  log('Loading index.html...');

  mainWindow.webContents.on('did-start-loading', () => {
    log('index.html - did-start-loading');
  });

  mainWindow.webContents.once('did-finish-load', () => {
    log('index.html - did-finish-load');
    log(`Window state after load - isVisible: ${mainWindow.isVisible()}`);
    updateWindowHeight();
  });
}

function updateWindowHeight() {
  log('updateWindowHeight() called');
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      document.body.scrollHeight
    `).then((height) => {
      log(`Measured scrollHeight: ${height}px`);
      const boundedHeight = Math.min(Math.max(height, 100), 800);
      log(`Calculated boundedHeight: ${boundedHeight}px`);
      mainWindow.setContentSize(300, boundedHeight);
      log(`Window resized to 300x${boundedHeight}`);
      log(`Final window size: ${mainWindow.getSize()}`);
      
      setTimeout(() => {
        log('\n=== DEBUG LOG COMPLETE ===');
        log(`Total events logged: ${debugLog.length}`);
      }, 1000);
    });
  }
}

app.on('ready', () => {
  log('=== APP READY ===');
  createSplashWindow();
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  log('App activated');
  if (mainWindow === null) {
    createSplashWindow();
  }
});

ipcMain.on('resize-window', () => {
  log('IPC: resize-window event received');
  updateWindowHeight();
});
