import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import React from 'react';
import Translate from '@docusaurus/Translate';
import clients from '../../static/downloads/client.json';
import './downloads.less';

export default function Downloads() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description={`${siteConfig.tagline}`}
    >
      <main>
        <div className="downloads-page">
          <div className="intro">
            <div className="intro-badge">客户端分发中心</div>
            <h1>下载財訊客户端</h1>
            <p>
              Web、桌面端与移动端统一接入同一套工作区。你可以先从 Web 开始，也可以直接下载桌面端或 Android 客户端。
            </p>
          </div>

          <div className="section">
            <div className="block">
              <img src="/img/gallery/download/mobile.png" />
            </div>

            <div className="block">
              <div className="status">移动端</div>
              <h3>Mobile Apps</h3>

              <p>适合随时查看消息、通讯录、发现与我的页面。Android 安装包可直接下载，iOS 保持后续上架。</p>

              <div className="btns">
                <Link
                  className="button button--primary"
                  to={clients.android.url}
                  data-tianji-event="download-android"
                >
                  Android
                </Link>
                <Link
                  className="button button--secondary disabled"
                  data-tianji-event="download-ios"
                >
                  iOS(准备中)
                </Link>
              </div>

              <p className="tip">
                Android 包默认读取站内相对地址，你只需要把 APK 放到服务器对应目录即可。
              </p>
            </div>
          </div>

          <div className="section reverse">
            <div className="block">
              <img src="/img/gallery/download/desktop.png" />
            </div>

            <div className="block">
              <div className="status">桌面端</div>
              <h3>Desktop Client</h3>

              <p>适合长期在线、群组讨论常驻、多会话并行与资料整理。Windows、macOS 与 Linux 均可通过站内分发链接下载。</p>

              <div className="btns">
                <Link
                  className="button button--primary"
                  to={clients.windows.url}
                  data-tianji-event="download-windows"
                >
                  Windows
                </Link>
                <Link
                  className="button button--secondary"
                  to={clients.darwin.url}
                  data-tianji-event="download-macos"
                >
                  macOS
                </Link>
                <Link
                  className="button button--secondary"
                  to={clients.linux.url}
                  data-tianji-event="download-linux"
                >
                  Linux
                </Link>
              </div>

              <p className="tip">
                桌面端安装包默认读取站内相对地址，你只需要把构建产物放到服务器对应目录即可。
              </p>
            </div>
          </div>

          <div className="web-card">
            <div className="status">Web</div>
            <h3>Web Client</h3>
            <p>如果你希望直接开始使用，可以先从 Web 端进入。Web 仍然是最完整、最稳定的使用入口。</p>
            <div className="btns">
              <Link className="button button--primary" to="/">
                立即进入 Web
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
