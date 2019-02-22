import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

app.getPath('appData');
//TODO: Options.json (app.getPath(appData))
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow;
let url = isDevelopment ? 'http://localhost:9080' : `file://${__dirname}/index.html`;

app.on('window-all-closed', () => {
  app.quit();
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
    })
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow = new BrowserWindow({
      height: 600,
      width: 1000,
      frame: false,
      show: false,
      minHeight: 500,
      minWidth: 800
    });
    mainWindow.loadURL(url);
    //mainWindow.webContents.openDevTools();
    
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();
      mainWindow.webContents.send('noUpdateReady');
    });
    ipcMain.on('closeWindow', () => mainWindow.close())
    ipcMain.on('resizeWindow', () => {
      if (mainWindow.isMaximized())
        mainWindow.unmaximize()
      else
        mainWindow.maximize();
    })
    ipcMain.on('minimizeWindow', () => mainWindow.minimize())
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
    /*mainWindow = new BrowserWindow({
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
      mainWindow.webContents.send('updateReady', 50);
    })*/
    mainWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      show: false
    });
    mainWindow.loadURL(url);
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();
      mainWindow.webContents.send('noUpdateReady');
    })
    ipcMain.on('closeWindow', () => mainWindow.close())
    ipcMain.on('resizeWindow', () => {
      if (mainWindow.isMaximized())
        mainWindow.unmaximize()
      else
        mainWindow.maximize();
    })
    ipcMain.on('minimizeWindow', () => mainWindow.minimize())
  });
}