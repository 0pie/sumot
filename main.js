const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db = null;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'sumot.db');

  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS game_info (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        counter INTEGER NOT NULL
      )
    `);

    db.run(`
      INSERT OR IGNORE INTO game_info (id, counter)
      VALUES (1, 0)
    `);
  });
}

ipcMain.handle("get-game-number", () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT counter FROM game_info WHERE id = 1", (err, row) => {
      if (err) reject(err);
      else resolve(row.counter);
    });
  });
});

ipcMain.handle("increment-game-number", () => {
  return new Promise((resolve, reject) => {
    db.run("UPDATE game_info SET counter = counter + 1 WHERE id = 1", err => {
      if (err) reject(err);

      db.get("SELECT counter FROM game_info WHERE id = 1", (err2, row) => {
        if (err2) reject(err2);
        else resolve(row.counter);
      });
    });
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
