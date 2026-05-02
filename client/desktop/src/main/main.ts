/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  desktopCapturer,
  DesktopCapturerSource,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { getCapturerSourcePickerUrl, resolveHtmlPath } from './util';
import windowStateKeeper from 'electron-window-state';
import is from 'electron-is';
import { initScreenshots } from './screenshots';
import { generateInjectedScript } from './inject';
import { handleTailchatMessage } from './inject/message-handler';
import { initWebviewManager } from './lib/webview-manager';

log.info('Start...');

if (is.dev()) {
  console.log('===========================');
  console.log('Log file:', log.transports.file.getFile().path);
  console.log('===========================');
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('DESKTOP_CAPTURER_GET_SOURCES', async (event, opts) => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
  });

  return new Promise((resolve) => {
    createCapturerSourcePicker(sources, (source) => {
      if (source) {
        resolve(source);
      } else {
        resolve(null);
      }
    });
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

if (app.isPackaged) {
  log.info('auto catch errors and overwrite default `console.log` functions');
  log.catchErrors();
  Object.assign(console, log.functions);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const webPreferences: Electron.WebPreferences = {
  nodeIntegration: false,
  contextIsolation: true,
  devTools: true,
  webSecurity: false, // skip same-origin
  allowRunningInsecureContent: true, // allow visit http page in https
  preload: app.isPackaged
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, '../../.erb/dll/preload.js'),
};

let welcomeWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let capturerSourcePickerWindow: BrowserWindow | null = null;
let currentWorkspaceUrl: string | null = null;
let isShowingRecoveryDialog = false;

const switchBackToWorkspaceSelector = () => {
  currentWorkspaceUrl = null;

  if (!welcomeWindow) {
    createWelcomeWindow();
  } else {
    welcomeWindow.show();
    welcomeWindow.focus();
  }

  if (mainWindow) {
    mainWindow.close();
  }
};

const createWelcomeWindow = async () => {
  // 创建一个新的浏览器窗口
  welcomeWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences,
  });

  // 加载欢迎窗口的HTML文件
  welcomeWindow.loadURL(resolveHtmlPath('index.html'));

  // 监听从渲染进程发送的选择用户事件
  // welcomeWindow.webContents.on('selectUser', (event, user) => {
  //   selectedUser = user;
  //   welcomeWindow.close(); // 关闭欢迎窗口
  //   createMainWindow(); // 创建主窗口
  // });

  welcomeWindow.webContents.on('ipc-message', (e, channel, data) => {
    log.info('[ipc-message]', channel, data);
    if (channel === 'close') {
      welcomeWindow?.close();
    } else if (channel === 'selectServer') {
      console.log(data);
      const url = data.url;

      createMainWindow(url).then(() => {
        welcomeWindow?.close();
      });
    }
  });

  welcomeWindow.on('closed', () => {
    welcomeWindow = null;
  });
};

const createMainWindow = async (url: string) => {
  try {
    log.info('Create window');

    if (isDebug) {
      log.info('Install extensions');
      await installExtensions();
    }

    currentWorkspaceUrl = url;
    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');
    log.info('parse resolve path:', RESOURCES_PATH);

    const mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800,
    });
    log.info('load window state with:', mainWindowState);

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };
    mainWindow = new BrowserWindow({
      show: false,
      x: mainWindowState.x,
      y: mainWindowState.y,
      height: mainWindowState.height,
      width: mainWindowState.width,
      icon: getAssetPath('icon.png'),
      webPreferences,
    });

    const applyWindowTitle = (subtitle?: string) => {
      if (!mainWindow) {
        return;
      }

      mainWindow.setTitle(
        subtitle ? `財訊桌面端 · ${subtitle}` : '財訊桌面端'
      );
    };

    applyWindowTitle('正在连接工作区');
    mainWindow.loadURL(url);

    /**
     * 如果存在
     * 注入 SERVICE_URL
     */
    if (process.env.SERVICE_URL) {
      mainWindow.webContents
        .executeJavaScript(
          `window.localStorage.setItem("serviceUrl", ${process.env.SERVICE_URL});`
        )
        .then(() => {
          log.info('Update Service Url Success:', process.env.SERVICE_URL);
        });
    }

    mainWindow.webContents.on('did-start-navigation', () => {
      if (mainWindow) {
        applyWindowTitle('正在连接工作区');
        mainWindow.setProgressBar(0.15);
        mainWindow.webContents.executeJavaScript(generateInjectedScript());
      }
    });

    mainWindow.webContents.on('did-start-loading', () => {
      if (!mainWindow) {
        return;
      }

      applyWindowTitle('正在同步页面内容');
      mainWindow.setProgressBar(0.45);
    });

    mainWindow.webContents.on('did-stop-loading', () => {
      if (!mainWindow) {
        return;
      }

      applyWindowTitle('工作区内容已就绪');
      mainWindow.setProgressBar(-1);
    });

    mainWindow.webContents.on(
      'page-title-updated',
      (event, title: string) => {
        event.preventDefault();
        applyWindowTitle(title);
      }
    );

    mainWindow.webContents.on(
      'did-fail-load',
      async (_event, errorCode, errorDescription) => {
        if (!mainWindow || errorCode === -3) {
          return;
        }

        log.error('main window load failed:', errorCode, errorDescription);
        applyWindowTitle('工作区加载失败');
        mainWindow.setProgressBar(-1);

        if (isShowingRecoveryDialog) {
          return;
        }

        isShowingRecoveryDialog = true;
        const result = await dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: '工作区加载失败',
          message: '当前工作区暂时无法加载',
          detail: `${errorDescription}（错误码: ${errorCode}）`,
          buttons: ['重试', '返回工作区选择'],
          cancelId: 1,
          defaultId: 0,
        });
        isShowingRecoveryDialog = false;

        if (!mainWindow) {
          return;
        }

        if (result.response === 0 && currentWorkspaceUrl) {
          applyWindowTitle('正在重新连接工作区');
          mainWindow.setProgressBar(0.2);
          mainWindow.loadURL(currentWorkspaceUrl);
          return;
        }

        switchBackToWorkspaceSelector();
      }
    );

    mainWindow.webContents.on('ipc-message', (e, channel, data) => {
      if (channel === 'webview-message') {
        const obj = JSON.parse(data);
        if (typeof obj === 'object' && obj._isTailchat === true && mainWindow) {
          handleTailchatMessage(
            obj.type,
            obj.payload,
            mainWindow.webContents,
            mainWindow
          );
        }
      }
    });

    mainWindow.on('focus', () => {
      mainWindow?.flashFrame(false);
    });

    mainWindow.on('ready-to-show', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }

      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    log.info('Build menu');
    const menuBuilder = new MenuBuilder(
      mainWindow,
      switchBackToWorkspaceSelector,
      currentWorkspaceUrl ?? undefined
    );
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    // 下载操作相关处理
    mainWindow.webContents.session.on('will-download', (event, item) => {
      // 下载开始前的回调函数
      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          log.warn('File download interrupted');
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            log.warn('File download paused');
          } else {
            log.info(
              `File download process: ${item.getReceivedBytes()} / ${item.getTotalBytes()} Bytes`
            );
          }
        }
      });

      item.once('done', (event, state) => {
        if (state === 'completed') {
          log.info('File download completed');
          const filePath = item.getSavePath();
          shell.showItemInFolder(filePath);
        } else {
          log.error(`File download failed: ${state}`);
        }
      });
    });

    mainWindowState.manage(mainWindow);

    initWebviewManager(mainWindow);

    // Remove this if your app does not use auto updates
    new AppUpdater();
  } catch (err) {
    log.error('createWindow error:', err);
  }
};

const createCapturerSourcePicker = async (
  sources: DesktopCapturerSource[],
  onSelected: (source: DesktopCapturerSource | null) => void
) => {
  // 创建一个新的浏览器窗口
  capturerSourcePickerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    parent: mainWindow ?? undefined,
    modal: true,
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    webPreferences,
  });

  // 加载欢迎窗口的HTML文件
  const htmlPath = getCapturerSourcePickerUrl();
  log.info('htmlPath', htmlPath);
  capturerSourcePickerWindow.webContents.loadFile(htmlPath);

  capturerSourcePickerWindow.webContents.on('did-finish-load', () => {
    if (capturerSourcePickerWindow) {
      capturerSourcePickerWindow.webContents.send(
        'SEND_SCREEN_SHARE_SOURCES',
        sources.map((s) => ({
          ...s,
          thumbnail: s.thumbnail.toDataURL(),
        }))
      );
    }
  });

  // 监听从渲染进程发送的选择捕获源事件
  capturerSourcePickerWindow.webContents.on(
    'ipc-message',
    (e, channel, data) => {
      if (channel === 'selectCapturerSource') {
        onSelected(data);
        if (capturerSourcePickerWindow) {
          capturerSourcePickerWindow.close();
        }
      }
    }
  );

  capturerSourcePickerWindow.on('closed', () => {
    onSelected(null);
    capturerSourcePickerWindow = null;
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWelcomeWindow();
    initScreenshots();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (welcomeWindow === null && mainWindow === null) {
        createWelcomeWindow();
      }
    });
  })
  .catch(log.error);
