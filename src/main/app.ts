import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, protocol } from 'electron';
import isDev from 'electron-is-dev';

import { WindowConfig } from './WindowConfig';

app.commandLine.appendSwitch('--disable-site-isolation-trials');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      supportFetchAPI: true,
      secure: true,
      corsEnabled: true,
    },
  },
]);

if (isDev) {
  require('electron-debug')();
}

class App {
  win1!: BrowserWindow;
  win2!: BrowserWindow;

  createWindow() {
    protocol.registerBufferProtocol('app', (request, response) => {
      let pathName = new URL(request.url).pathname;
      const extension = path.extname(pathName).toLowerCase();
      if (!extension) return;

      pathName = decodeURI(pathName);

      const filePath = path.join(__dirname, pathName);
      fs.readFile(filePath, (error, data) => {
        if (error) {
          console.error(error);
          return;
        }

        let mimeType = '';
        switch (extension) {
          case '.js':
            mimeType = 'text/javascript';
            break;
          case '.html':
            mimeType = 'text/html';
            break;
          case '.css':
            mimeType = 'text/css';
            break;
          case '.svg':
            mimeType = 'image/svg+xml';
            break;
          case '.json':
            mimeType = 'application/json';
            break;
          default:
            break;
        }

        response({
          mimeType,
          data,
        });
      });
    });
    const config = new WindowConfig();
    config.frame = true;
    config.width = 1024;
    config.height = 800;
    config.show = true;

    this.win1 = new BrowserWindow({
      ...config,
      x: 10,
      y: 100,
    });

    if (app.isPackaged) {
      this.win1.loadURL('app://./index.html');
    } else {
      this.win1.loadURL(`http://localhost:${process.env.WEB_PORT}/#/call`);
    }

    this.win2 = new BrowserWindow({
      ...config,
      x: 300,
      y: 100,
    });

    if (app.isPackaged) {
      this.win2.loadURL('app://./index.html');
    } else {
      this.win2.loadURL(`http://localhost:${process.env.WEB_PORT}/#/answer`);
    }
  }

  constructor() {
    app.on('ready', async () => {
      this.createWindow();
    });
  }
}

(globalThis as any).appEntry = new App();

// const startTime = Date.now();
// let mainWin: BrowserWindow;

// app.on('ready', () => {
//   protocol.registerBufferProtocol('app', (request, response) => {
//     let pathName = new URL(request.url).pathname;
//     let extension = path.extname(pathName).toLowerCase();
//     if (!extension) return;

//     pathName = decodeURI(pathName);

//     const filePath = path.join(__dirname, pathName);
//     fs.readFile(filePath, (error, data) => {
//       if (error) {
//         console.error(error);
//         return;
//       }

//       let mimeType = '';
//       switch (extension) {
//         case '.js':
//           mimeType = 'text/javascript';
//           break;
//         case '.html':
//           mimeType = 'text/html';
//           break;
//         case '.css':
//           mimeType = 'text/css';
//           break;
//         case '.svg':
//           mimeType = 'image/svg+xml';
//           break;
//         case '.json':
//           mimeType = 'application/json';
//           break;
//         default:
//           break;
//       }

//       response({
//         mimeType,
//         data,
//       });
//     });
//   });

//   mainWin = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       webSecurity: false,
//       nodeIntegration: true,
//       contextIsolation: false,
//       enableRemoteModule: true,
//     },
//   });

//   console.log(startTime, Date.now() - startTime);
//   if (app.isPackaged) {
//     mainWin.loadURL('app://./index.html');
//   } else {
//     mainWin.loadURL(`http://localhost:${process.env.WEB_PORT}/`);
//   }
// });
