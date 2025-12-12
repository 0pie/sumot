const { fetchDefinitionFromDicolink } = require("./src/definition.js"); 
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

let SQL = null;
let db = null;
let dbPath = null;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function initDatabase() {
  dbPath = path.join(app.getPath('userData'), 'sumot.sqlite');

  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE game_info (
        id INTEGER PRIMARY KEY,
        counter INTEGER NOT NULL
      );
    `);
    db.run(`INSERT INTO game_info (id, counter) VALUES (1, 0);`);
    saveDb();
  }
}

ipcMain.handle("get-game-number", () => {
  const res = db.exec("SELECT counter FROM game_info WHERE id = 1");
  return res?.[0]?.values?.[0]?.[0] ?? 0;
});

ipcMain.handle("increment-game-number", () => {
  db.run("UPDATE game_info SET counter = counter + 1 WHERE id = 1");
  saveDb();

  const res = db.exec("SELECT counter FROM game_info WHERE id = 1");
  return res[0].values[0][0];
});

ipcMain.handle("get-definition", async (event, word) => {
    return await fetchDefinitionFromDicolink(word);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
