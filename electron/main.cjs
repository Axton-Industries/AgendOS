"use strict";
const { app, BrowserWindow } = require("electron");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

const APP_DIR = path.join(__dirname, "..");
let nextProcess = null;
let mainWindow = null;

function findFreePort(preferred = 3000) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => {
      const s2 = net.createServer();
      s2.listen(0, "127.0.0.1", () => {
        const { port } = s2.address();
        s2.close(() => resolve(port));
      });
    });
    srv.once("listening", () => srv.close(() => resolve(preferred)));
    srv.listen(preferred, "127.0.0.1");
  });
}

function waitForPort(port, timeoutMs = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const s = net.connect({ host: "127.0.0.1", port });
      s.once("connect", () => {
        s.destroy();
        resolve();
      });
      s.once("error", () => {
        s.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`El servidor no respondio en el puerto ${port}`));
        } else {
          setTimeout(check, 200);
        }
      });
    };
    check();
  });
}

function stopNext() {
  if (!nextProcess) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(nextProcess.pid), "/f", "/t"]);
    } else {
      nextProcess.kill("SIGTERM");
    }
  } catch {}
  nextProcess = null;
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "AgendOS",
    backgroundColor: "#09090b",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const port = await findFreePort(3000);
  const nextBin = path.join(APP_DIR, "node_modules", "next", "dist", "bin", "next");
  nextProcess = spawn(
    "node",
    [nextBin, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: APP_DIR, stdio: "inherit" },
  );
  nextProcess.on("exit", () => {
    nextProcess = null;
  });

  try {
    await waitForPort(port);
    createWindow(port);
  } catch (err) {
    console.error(err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  stopNext();
  app.quit();
});

app.on("before-quit", stopNext);