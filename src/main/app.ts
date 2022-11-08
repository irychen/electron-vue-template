const start = Date.now();
import { app, BrowserWindow, protocol } from "electron";
import path from "path";
import fs from "fs";
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      supportFetchAPI: true,
      secure: true,
      corsEnabled: true,
    },
  },
]);
let mainWindow: BrowserWindow;
app.on("ready", () => {
  protocol.registerBufferProtocol("app", (request, response) => {
    let pathName = new URL(request.url).pathname;
    let extension = path.extname(pathName).toLowerCase();
    if (!extension) return;
    pathName = decodeURI(pathName);
    let filePath = path.join(__dirname, pathName);
    fs.readFile(filePath, (error, data) => {
      if (error) return;
      let mimeType = "";
      if (extension === ".js") {
        mimeType = "text/javascript";
      } else if (extension === ".html") {
        mimeType = "text/html";
      } else if (extension === ".css") {
        mimeType = "text/css";
      } else if (extension === ".svg") {
        mimeType = "image/svg+xml";
      } else if (extension === ".json") {
        mimeType = "application/json";
      }
      response({ mimeType, data });
    });
  });
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  if (app.isPackaged) {
    console.log(start, Date.now() - start, "Packaged");
    mainWindow.loadURL(`app://./index.html`);
  } else {
    console.log(new Date(start));
    console.log("启动耗时：", Date.now() - start + "ms");
    console.log("启动类型：", "Not Packaged");
    console.log(`Web visit: http://localhost:${process.env.WEB_PORT}`);
    mainWindow.loadURL(`http://localhost:${process.env.WEB_PORT}/`);
  }
});
