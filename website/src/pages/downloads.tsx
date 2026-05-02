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
            <h1>先用 Web 内测，再逐步切换到桌面端与移动端</h1>
            <p>
              当前財訊客户端已经进入可内测阶段。推荐优先使用 Web
              端完成主链路体验，桌面端适合长期使用，移动端继续进行入口和商城上架前准备。
            </p>
          </div>

          <div className="section">
            <div className="block">
              <img src="/img/gallery/download/mobile.png" />
            </div>

            <div className="block">
              <div className="status">移动端 · 内测准备中</div>
              <h3>Mobile Apps</h3>

              <p>适合随时查看动态、群讨论与消息流，当前正在继续完善入口体验与后续商城上架准备。</p>

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
                React Native 客户端源码：&nbsp;
                <Link
                  to="https://github.com/msgbyte/tailchat/tree/master/client/mobile"
                  data-tianji-event="mobile-source-code"
                >
                  Source Code
                </Link>
              </p>
            </div>
          </div>

          <div className="section reverse">
            <div className="block">
              <img src="/img/gallery/download/desktop.png" />
            </div>

            <div className="block">
              <div className="status">桌面端 · 推荐长期使用</div>
              <h3>Desktop Client</h3>

              <p>适合长期盯盘、群讨论常驻、观点整理与多会话并行使用，是当前最适合深度体验財訊客户端的安装形态。</p>

              <div className="btns">
                <Link
                  className="button button--primary"
                  to={clients.windows.url}
                  data-tianji-event="download-windows"
                >
                  Windows
                </Link>
                <Link
                  className="button button--secondary disabled"
                  data-tianji-event="download-macos"
                >
                  macOS(准备中)
                </Link>
                <Link
                  className="button button--secondary disabled"
                  data-tianji-event="download-linux"
                >
                  Linux(准备中)
                </Link>
              </div>

              <p className="tip">
                Electron 客户端源码：&nbsp;
                <Link
                  to="https://github.com/msgbyte/tailchat/tree/master/client/desktop"
                  data-tianji-event="desktop-source-code"
                >
                  Source Code
                </Link>
              </p>
            </div>
          </div>

          <div className="web-card">
            <div className="status">Web · 当前主入口</div>
            <h3>Web Client</h3>
            <p>如果你是第一次体验，建议先从 Web 端开始。当前 Web 端已经进入可内测阶段，也是功能最完整、体验最稳定的入口。</p>
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
