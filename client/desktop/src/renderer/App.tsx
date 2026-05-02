import icon from '../../assets/icon.svg';
import { ServerItem } from './ServerItem';
import React from 'react';
import { defaultServerList, useServerStore } from './store/server';
import { AddServerItem } from './AddServerItem';
import { Dropdown, Modal } from 'antd';
import './App.css';

const Hello: React.FC = React.memo(() => {
  const { serverList, removeServer } = useServerStore();
  const allServers = [...defaultServerList, ...serverList];
  const [enteringServerUrl, setEnteringServerUrl] = React.useState<string | null>(
    null
  );

  return (
    <div className="app-shell">
      <div className="hero-card">
        <div className="hero-brand">
          <img src={icon} alt="財訊" className="hero-logo" />
          <div>
            <div className="hero-kicker">財訊桌面客户端</div>
            <h1>选择你的工作区，开始长期交流与研究</h1>
          </div>
        </div>
        <p className="hero-description">
          桌面端适合长期盯盘、观点沉淀、群组讨论和会话常驻。当前版本已进入内测阶段，推荐优先使用默认工作区开始体验。
        </p>
        {enteringServerUrl && (
          <div className="hero-entering">
            正在连接当前工作区并准备主窗口，请稍候…
          </div>
        )}
        <div className="hero-tips">
          <span>推荐 Windows 长时间使用</span>
          <span>支持自定义服务器</span>
          <span>后续继续推进移动端上架准备</span>
        </div>
      </div>

      <div className="section-title">可用工作区</div>
      <div className="server-list">
        {allServers.map((serverInfo, i) => {
          const isDefaultServer = i < defaultServerList.length;
          const entering = enteringServerUrl === serverInfo.url;

          return (
            <Dropdown
              key={i}
              trigger={['contextMenu']}
              menu={{
                items: [
                  {
                    key: 'remove',
                    label: '删除服务器',
                    disabled: isDefaultServer,
                    onClick: () => {
                      Modal.confirm({
                        title: '确认删除这个服务器入口？',
                        onOk() {
                          removeServer(serverInfo.url);
                        },
                      });
                    },
                  },
                ],
              }}
            >
              <div>
                <ServerItem
                  icon={serverInfo.icon ?? icon}
                  version={serverInfo.version}
                  url={serverInfo.url}
                  badge={isDefaultServer ? '推荐' : '自定义'}
                  subtitle={
                    isDefaultServer
                      ? '建议从默认工作区开始体验財訊桌面端'
                      : '你手动添加的服务器入口'
                  }
                  entering={entering}
                  onClick={() => {
                    setEnteringServerUrl(serverInfo.url);
                    window.electron.ipcRenderer.sendMessage('selectServer', {
                      url: serverInfo.url,
                    });
                  }}
                >
                  {serverInfo.name}
                </ServerItem>
              </div>
            </Dropdown>
          );
        })}

        <AddServerItem />
      </div>

      <div className="actions">
        <button
          className="primary"
          type="button"
          disabled={Boolean(enteringServerUrl)}
          onClick={() => {
            window.open('https://tailchat.msgbyte.com/');
          }}
        >
          访问官网
        </button>

        <button
          type="button"
          disabled={Boolean(enteringServerUrl)}
          onClick={() => {
            window.open('https://tailchat.msgbyte.com/downloads');
          }}
        >
          查看下载与平台说明
        </button>

        <button
          type="button"
          disabled={Boolean(enteringServerUrl)}
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('close');
          }}
        >
          退出
        </button>
      </div>
    </div>
  );
});
Hello.displayName = 'Hello';

export default function App() {
  return <Hello />;
}
