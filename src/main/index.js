import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater'
const isDevelopment = process.env.NODE_ENV !== 'production';
import fs from 'fs'

var path = app.getPath('appData');
if (process.platform === 'win32')
  path += '\\youtube-downloader\\'
else
  path += '/youtube-downloader/'

if (!fs.existsSync(path + "config.json")) {
  var options = {
    path: app.getPath('music'),
    bitrate: 192,
    numDown: 3,
    theme: 0,
    filterNum: 2000,
    listNum: 30,
  }
  fs.writeFileSync(path + "config.json", JSON.stringify(options), 'utf8');
}

let mainWindow;
let url = isDevelopment ? 'http://localhost:9080' : `file://${__dirname}/index.html`;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
});

app.on('activate', () => {
  if (mainWindow === null) mainWindow = createMainWindow();
});

if (!isDevelopment) {
  app.on('ready', () => {
      autoUpdater.autoInstallOnAppQuit = false;
      autoUpdater.checkForUpdates();
  });

  autoUpdater.on('update-available', () => {
    mainWindow = new BrowserWindow({
      height: 400,
      width: 300,
      frame: false,
      show: false,
      resizable: false
    });
    mainWindow.loadURL(url);
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();
      mainWindow.webContents.send('updateReady', 0);
      mainWindow.webContents.send('configPath', path)
    })
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow = new BrowserWindow({
      height: 630,
      width: 875,
      frame: false,
      show: false,
      minHeight: 600,
      minWidth: 875,
      webPreferences: {
        nodeIntegrationInWorker: true
      }
    });
    mainWindow.loadURL(url);    
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();
      mainWindow.webContents.send('noUpdateReady');
      mainWindow.webContents.send('configPath', path)
    });
    ipcMain.on('closeWindow', () => mainWindow.close())
    ipcMain.on('resizeWindow', () => {
      if (mainWindow.isMaximized())
        mainWindow.unmaximize()
      else
        mainWindow.maximize();
    })
    ipcMain.on('minimizeWindow', () => mainWindow.minimize())
    ipcMain.on('openFolder', (event, arg) => {
      shell.showItemInFolder(arg);
    })
    ipcMain.on('window', () => {
      mainWindow.focus();
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('updateReady', progress.percent)
  })

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  })

  autoUpdater.on('error', message => {
    dialog.showErrorBox("Error", message);
  })
}
else {
  app.on('ready', () => {
    mainWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      frame: false,
      show: false,
      minHeight: 600,
      minWidth: 875,
      webPreferences: {
        nodeIntegrationInWorker: true
      }
    });
    mainWindow.loadURL(url);
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();
      mainWindow.webContents.send('noUpdateReady');
      mainWindow.webContents.send('configPath', path)
    })
    ipcMain.on('closeWindow', () => mainWindow.close())
    ipcMain.on('resizeWindow', () => {
      if (mainWindow.isMaximized())
        mainWindow.unmaximize()
      else
        mainWindow.maximize();
    })
    ipcMain.on('minimizeWindow', () => mainWindow.minimize())
    ipcMain.on('window', () => {
      mainWindow.focus();
    })
  });
}