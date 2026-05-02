import React from 'react';
import Layout from '@theme/Layout';

export default function TrustPage() {
  return (
    <Layout title="安全與合規 - 財訊" description="財訊安全與合規說明">
      <main className="container margin-vert--lg">
        <h1>財訊 · 安全與合規</h1>
        <p>平台主體為日斗投資諮詢有限公司，面向日斗投資財富論壇第十屆交流會與內部交流場景。</p>
        <p>全站傳輸採用 TLS 1.3 並配合 HSTS，數據節點部署於日本東京區域，核心數據執行每日備份與加密保護。</p>
        <p>信任標識：SSL 加密、每日備份、GDPR Ready。</p>
      </main>
    </Layout>
  );
}
