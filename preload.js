const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("sumot", {
    getGameNumber: () => ipcRenderer.invoke("get-game-number"),
    incrementGameNumber: () => ipcRenderer.invoke("increment-game-number"),
    copyText: (str) => navigator.clipboard.writeText(str)
});