import {
  app,
  clipboard,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import log from 'electron-log';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  onSwitchWorkspace?: () => void;
  onReconnectWorkspace?: () => void;
  workspaceUrl?: string;

  constructor(
    mainWindow: BrowserWindow,
    onSwitchWorkspace?: () => void,
    workspaceUrl?: string,
    onReconnectWorkspace?: () => void
  ) {
    this.mainWindow = mainWindow;
    this.onSwitchWorkspace = onSwitchWorkspace;
    this.workspaceUrl = workspaceUrl;
    this.onReconnectWorkspace = onReconnectWorkspace;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildWorkspaceSubmenu(): MenuItemConstructorOptions[] {
    const workspaceHost = this.workspaceUrl
      ? (() => {
          try {
            return new URL(this.workspaceUrl).host;
          } catch {
            return this.workspaceUrl;
          }
        })()
      : undefined;

    return [
      {
        label: workspaceHost ? `当前工作区：${workspaceHost}` : '当前工作区：未连接',
        enabled: false,
      },
      {
        type: 'separator',
      },
      {
        label: '重新连接当前工作区',
        enabled: Boolean(this.workspaceUrl),
        click: () => {
          this.onReconnectWorkspace?.();
        },
      },
      {
        label: '在浏览器打开当前工作区',
        enabled: Boolean(this.workspaceUrl),
        click: () => {
          if (this.workspaceUrl) {
            shell.openExternal(this.workspaceUrl);
          }
        },
      },
      {
        label: '复制当前工作区地址',
        enabled: Boolean(this.workspaceUrl),
        click: () => {
          if (this.workspaceUrl) {
            clipboard.writeText(this.workspaceUrl);
          }
        },
      },
      {
        label: '返回工作区选择',
        click: () => {
          this.onSwitchWorkspace?.();
        },
      },
    ];
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Tailchat',
      submenu: [
        {
          label: 'About Tailchat',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide Tailchat',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuView: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        {
          label: '返回工作区选择',
          accelerator: 'Shift+Command+W',
          click: () => {
            this.onSwitchWorkspace?.();
          },
        },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuWorkspace: MenuItemConstructorOptions = {
      label: 'Workspace',
      submenu: this.buildWorkspaceSubmenu(),
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://tailchat.msgbyte.com/');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal('https://tailchat.msgbyte.com/docs/intro');
          },
        },
        {
          label: 'Github',
          click() {
            shell.openExternal('https://github.com/msgbyte/tailchat');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/msgbyte/tailchat/issues');
          },
        },
      ],
    };

    return [
      subMenuAbout,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      subMenuWorkspace,
      subMenuHelp,
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
          {
            label: '返回工作区选择',
            accelerator: 'Ctrl+Shift+W',
            click: () => {
              this.onSwitchWorkspace?.();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      {
        label: '工作区',
        submenu: this.buildWorkspaceSubmenu(),
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('https://tailchat.msgbyte.com/');
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal('https://tailchat.msgbyte.com/docs/intro');
            },
          },
          {
            label: 'Github',
            click() {
              shell.openExternal('https://github.com/msgbyte/tailchat');
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/msgbyte/tailchat/issues');
            },
          },
          {
            label: 'Logs',
            click() {
              shell.showItemInFolder(log.transports.file.getFile().path);
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
