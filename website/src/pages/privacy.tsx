import React from 'react';
import Layout from '@theme/Layout';

export default function PrivacyPage() {
  return (
    <Layout title="隱私政策 - 財訊" description="財訊隱私政策">
      <main className="container margin-vert--lg">
        <h1>隱私政策</h1>
        <p>我們可能收集賬號信息、互動記錄、聊天內容、設備信息與必要網絡信息，以支持平台運行與安全保障。</p>
        <p>平台數據主要存儲於日本東京區域數據節點，傳輸層使用 TLS 1.3，核心數據採用 AES-256 級別保護並配合每日備份。</p>
        <p>您有權查詢、更正、刪除或申請註銷賬號，並可聯繫日斗投資諮詢有限公司提交相關申請。</p>
      </main>
    </Layout>
  );
}
