const { app, ipcMain, BrowserWindow, safeStorage, shel, dialog } = require("electron");
const ElectronStore = require('electron-store');

let appWin;

ElectronStore.initRenderer();

createWindow = () => {
    appWin = new BrowserWindow({
        width: 1366,
        height: 768,
        minWidth: 1366,
        minHeight: 768,
        title: "Edgerunner",
        icon: `${__dirname}/icon.icns`,
        resizable: true,
        webPreferences: {
            preload:  `${__dirname}/preload.js`,
            nodeIntegration: true
        }
    });

    // Safe storage handles
    ipcMain.handle('hasEncription', (event, ...args) => safeStorage.isEncryptionAvailable());
    ipcMain.handle('encrypt', (event, ...args) => safeStorage.encryptString(args[0]));
    ipcMain.handle('decrypt', (event, ...args) => safeStorage.decryptString(args[0]));

    // App version
    ipcMain.handle('appVersion', () => app.getVersion());

    // External link
    ipcMain.handle('openLink', (event, ...args) => shell.openExternal(args[0]));
    
    // Save and read files
    ipcMain.handle('saveToFile', (event, ...args) => {
        var selectedPath = dialog.showSaveDialogSync({ defaultPath: args[1] });
        if(selectedPath){
            require('fs').writeFileSync(selectedPath, args[0]);
            return true;
        }
        return false;
    }); 
    ipcMain.handle('readFromFile', (event, ...args) => {
        var selectedPaths = dialog.showOpenDialogSync({ properties: ['openFile'], filters: [
            { name: 'JSON', extensions: ['json', 'jsn', 'txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]});
        if(selectedPaths.length > 0){
            const data = require('fs').readFileSync(selectedPaths[0],{encoding:'utf8', flag:'r'});
            return data;
        }
        return "";
    }); 

    appWin.loadURL(`file://${__dirname}/dist/index.html`);

    appWin.setMenu(null);

    appWin.webContents.openDevTools();

    appWin.on("closed", () => {
        appWin = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});
