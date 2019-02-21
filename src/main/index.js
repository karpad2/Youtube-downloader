import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

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
    height: 500,
    width: 400,
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
    height: 640,
    width: 1024,
    show: false
  });
  mainWindow.loadURL(url);
  //mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.show();
    mainWindow.webContents.send('noUpdateReady');
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
    /*mainWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      show: false
    });
    mainWindow.loadURL(url);
    //mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.show();
      mainWindow.webContents.send('noUpdateReady');
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
  });
}