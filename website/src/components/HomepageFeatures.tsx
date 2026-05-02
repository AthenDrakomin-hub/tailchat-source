import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';
import { translate } from '@docusaurus/Translate';

const FeatureList = [
  {
    title: translate({ message: '內部通訊' }),
    Svg: require('../../static/img/undraw_Website_setup_re_d4y9.svg').default,
    description: (
      <>
        <code>財訊</code> 以穩重、克制、正式的金融科技風格承接日斗投資財富論壇內部交流，
        讓消息、公告、語音互動與學習陪伴在同一個界面內完成。
      </>
    ),
  },
  {
    title: translate({ message: '活動承接' }),
    Svg: require('../../static/img/undraw_design_components_9vy6.svg').default,
    description: (
      <>
        本輪以 <code>第十屆交流會</code> 為核心活動標識，將品牌、社群、協議、
        風險提示與信任說明統一到客戶端與官網展示層。
      </>
    ),
  },
  {
    title: translate({ message: '安全與合規' }),
    Svg: require('../../static/img/undraw_open_source_1qxw.svg').default,
    description: (
      <>
        平台展示基於真實技術能力整理，包括 <code>TLS 1.3</code>、<code>HSTS</code>、
        日本東京數據節點、每日備份與消息傳輸/落盤加密等安全能力。
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
