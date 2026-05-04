import Layout from '@theme/Layout';
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
              Web 与移动端统一接入同一套工作区。当前版本主推 Android 客户端，PC 端默认通过浏览器安装为 PWA 使用。
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
                <a
                  className="button button--primary"
                  href={clients.android.url}
                >
                  Android
                </a>
                <a
                  className="button button--secondary disabled"
                  href="#"
                >
                  iOS(准备中)
                </a>
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
              <div className="status">PWA</div>
              <h3>Desktop via PWA</h3>

              <p>PC 端当前不再单独发布 Windows、macOS 与 Linux 原生安装包。推荐直接访问 Web 主站，并在浏览器中安装为 PWA 应用。</p>

              <div className="btns">
                <a
                  className="button button--primary"
                  href={clients.pwa.url}
                >
                  打开 Web / 安装 PWA
                </a>
              </div>

              <p className="tip">
                支持安装为桌面应用的浏览器，可直接使用“安装应用 / 添加到桌面 / 创建快捷方式”等功能。
              </p>
            </div>
          </div>

          <div className="web-card">
            <div className="status">Web</div>
            <h3>Web Client</h3>
            <p>如果你希望直接开始使用，可以先从 Web 端进入。Web 仍然是最完整、最稳定的使用入口，PWA 也基于当前 Web 主站能力提供。</p>
            <div className="btns">
              <a className="button button--primary" href="/">
                立即进入 Web
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
