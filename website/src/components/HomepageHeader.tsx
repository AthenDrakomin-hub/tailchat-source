import React from 'react';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import './HomepageHeader.less';

export const HomepageHeader: React.FC = React.memo(() => {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();

  return (
    <div className="homepage-header">
      <Head>
        <link rel="prefetch" href="/img/hero-light.png" />
        <link rel="prefetch" href="/img/hero-dark.png" />
        <meta
          name="description"
          content="財訊｜日斗投資財富交流會第十屆。專為日斗投資諮詢有限公司會員打造的內部通訊與投資論壇，實時交流、語音互動。"
        />
        <meta property="og:title" content="財訊 - 第十屆投資財富交流會" />
        <meta
          property="og:description"
          content="日斗投資財富論壇官方內部通訊與投資交流平台"
        />
        <meta property="og:image" content="/img/caixun-og.png" />
      </Head>

      <div className="screenshot">
        <img src={`/img/hero-${colorMode}.png`} alt="Preview of 財訊" />
      </div>

      <div className="header">
        <h1 className="title">財訊</h1>
        <h3 className="title">日斗投資財富論壇 · 第十屆交流會</h3>

        <p className="desc">
          {siteConfig.tagline}
          <small>日斗投資諮詢有限公司 · 內部通訊 · 投資論壇 · 語音互動</small>
        </p>

        <div className="btns">
          <Link
            className="button button--primary button--lg"
            to="/trust"
          >
            安全與合規
          </Link>

          <Link
            className="button button--secondary button--lg"
            to="/about"
          >
            關於我們
          </Link>
        </div>

        <div className="link">
          <Link to="/privacy">查看隱私政策、用戶協議與社區公約</Link>
        </div>

        <div className="version">
          官方定位：內部會員交流與語音互動平台
        </div>
      </div>
    </div>
  );
});
HomepageHeader.displayName = 'HomepageHeader';
