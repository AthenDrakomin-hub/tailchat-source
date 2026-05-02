# 財訊 Client Brand And Trust Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以客戶端優先方式，將用戶可見層品牌從歷史 Tailchat 體驗收口為「財訊」，同時落地關於我們、協議文檔、安全與合規頁、活動展示、圖標與基礎 SEO。

**Architecture:** 不做高風險全倉物理 rename，而是在 `client/web` 和 `website` 中新增一套展示層品牌與信任承接。客戶端以現有品牌常量、設置面板、入口頁和路由為基礎擴展正式頁面；官網只同步首頁、標題、圖標和信任入口，不在本輪替換所有歷史技術文檔。

**Tech Stack:** React、React Router、Webpack、Tailwind、Ant Design、Docusaurus、shared brand constants、PNG/SVG favicon assets

---

## File Structure Map

### 需要新增

- `client/web/src/routes/Entry/AboutView.tsx`
  - 客戶端入口層正式「關於我們」頁
- `client/web/src/routes/Entry/LegalView.tsx`
  - 客戶端入口層法律文檔通用承接頁
- `client/web/src/routes/Entry/TrustView.tsx`
  - 客戶端入口層「安全與合規」頁
- `client/web/src/routes/Entry/components/EventBanner.tsx`
  - 登錄/註冊/忘記密碼/訪客入口共用活動條
- `client/web/src/routes/Entry/components/TrustLinks.tsx`
  - 入口頁共用底部信任入口
- `client/web/src/routes/Entry/content/legal.tsx`
  - 用戶協議、隱私政策、社區公約、安全與合規文案源
- `client/web/assets/images/brand/favicon-16.png`
- `client/web/assets/images/brand/favicon-32.png`
- `client/web/assets/images/brand/apple-touch-icon.png`
- `client/web/assets/images/brand/logo-192.png`
- `client/web/assets/images/brand/logo-512.png`
- `client/web/assets/images/brand/og-caixun.png`
- `website/src/pages/about.tsx`
- `website/src/pages/privacy.tsx`
- `website/src/pages/terms.tsx`
- `website/src/pages/community.tsx`
- `website/src/pages/trust.tsx`
- `website/static/img/caixun-og.png`

### 需要修改

- `client/shared/utils/brand.ts`
  - 品牌常量、主體信息、活動信息、法律文案入口與信任常量
- `client/web/src/components/BrandLogo.tsx`
  - 接新品牌圖
- `client/web/assets/template.html`
  - favicon / apple touch / title / meta description / OG
- `client/web/assets/pwa.webmanifest`
  - PWA 名稱與圖標
- `client/web/build/webpack.config.ts`
  - 確保品牌圖標和 OG 素材輸出
- `client/web/src/routes/Entry/index.tsx`
  - 掛關於、法律、信任子路由
- `client/web/src/routes/Entry/LoginView.tsx`
- `client/web/src/routes/Entry/RegisterView.tsx`
- `client/web/src/routes/Entry/GuestView.tsx`
- `client/web/src/routes/Entry/ForgetPasswordView.tsx`
  - 入口頁品牌、活動條、協議入口、標題信息
- `client/web/src/components/modals/SettingsView/About.tsx`
  - 關於內容升級並鏈到正式頁
- `client/web/src/components/modals/SettingsView/index.tsx`
  - 加入法律與信任入口
- `client/web/src/App.tsx`
  - 如需補正式入口路由或 head 管理掛點
- `client/web/src/init.tsx`
  - 補全標題或 meta 初始化時機
- `website/docusaurus.config.js`
  - 網站 title、tagline、favicon、navbar、footer、seo
- `website/src/components/HomepageHeader.tsx`
- `website/src/components/HomepageFeatures.tsx`
  - 官網首頁品牌與信任承接

### 需要驗證

- `client/web` 類型檢查與構建
- 根工作區 `pnpm build`
- 官網 Docusaurus 構建

---

### Task 1: 品牌常量與文案源重構

**Files:**
- Modify: `client/shared/utils/brand.ts`
- Test: `client/web` 入口頁與設置頁的現有引用編譯通過

- [ ] **Step 1: 寫出品牌常量改造清單**

```ts
export const BRAND_NAME_FULL = '財訊';
export const BRAND_NAME_SHORT = '財訊';
export const BRAND_SUBTITLE = '日斗投資財富論壇';
export const BRAND_COMPANY = '日斗投資諮詢有限公司';
export const BRAND_EVENT_NAME = '第十屆交流會';
export const BRAND_EVENT_FULL = '第十屆投資財富交流會';
export const BRAND_TAGLINE = '內部通訊 · 投資論壇 · 語音互動';
```

- [ ] **Step 2: 補齊法律與信任文案常量**

```ts
export const PRIVACY_TITLE = '隱私政策';
export const TERMS_TITLE = '用戶協議';
export const COMMUNITY_TITLE = '社區公約';
export const TRUST_TITLE = '財訊 · 安全與合規';
export const ENTRY_META_DESCRIPTION =
  '財訊｜日斗投資財富交流會第十屆。專為日斗投資諮詢有限公司會員打造的內部通訊與投資論壇，實時交流、語音互動。';
```

- [ ] **Step 3: 將現有風險宣言與新協議體系對齊**

```ts
export const RISK_DECLARATION_TITLE = '投資風險提示';
export const RISK_AGREE_LABEL = '我已閱讀並同意《用戶協議》與《隱私政策》';
```

- [ ] **Step 4: 運行客戶端類型檢查，確認常量替換不破壞現有引用**

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/shared/utils/brand.ts
git commit -m "refactor(client): introduce caixun brand constants"
```

### Task 2: 品牌圖標與 Logo 資產落地

**Files:**
- Modify: `client/web/src/components/BrandLogo.tsx`
- Create: `client/web/assets/images/brand/favicon-16.png`
- Create: `client/web/assets/images/brand/favicon-32.png`
- Create: `client/web/assets/images/brand/apple-touch-icon.png`
- Create: `client/web/assets/images/brand/logo-192.png`
- Create: `client/web/assets/images/brand/logo-512.png`
- Create: `client/web/assets/images/brand/og-caixun.png`
- Modify: `client/web/assets/template.html`
- Modify: `client/web/assets/pwa.webmanifest`

- [ ] **Step 1: 产出「財訊」品牌图标素材**

```text
16x16   小尺寸徽记
32x32   小尺寸徽记
180x180 Apple Touch Icon
192x192 PWA Icon
512x512 PWA Icon
1200x630 Open Graph 分享图（含「財訊」「第十屆交流會」）
```

- [ ] **Step 2: 接入 BrandLogo 组件**

```tsx
import logoLightUrl from '@assets/images/brand/logo-light.png';
import logoDarkUrl from '@assets/images/brand/logo-dark.png';

export const BrandLogo = React.memo((props) => {
  return <img src={isDarkMode ? logoDarkUrl : logoLightUrl} ... />;
});
```

- [ ] **Step 3: 修改 HTML 模板头部**

```html
<title>財訊 - 第十屆投資財富交流會</title>
<meta name="description" content="財訊｜日斗投資財富交流會第十屆。專為日斗投資諮詢有限公司會員打造的內部通訊與投資論壇，實時交流、語音互動。">
<meta property="og:title" content="財訊 - 第十屆投資財富交流會">
<meta property="og:description" content="日斗投資財富論壇官方內部通訊與投資交流平台">
<meta property="og:image" content="/images/brand/og-caixun.png">
<link rel="icon" type="image/png" sizes="16x16" href="/images/brand/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/images/brand/favicon-32.png">
<link rel="apple-touch-icon" href="/images/brand/apple-touch-icon.png">
```

- [ ] **Step 4: 修改 PWA manifest**

```json
{
  "name": "財訊",
  "short_name": "財訊",
  "description": "日斗投資財富論壇第十屆交流會內部通訊平台"
}
```

- [ ] **Step 5: 構建客户端，确认图标资源正常输出**

Run: `pnpm --dir /workspace/tailchat-source/client/web build:ci`  
Expected: PASS and generated assets reference new icon files

- [ ] **Step 6: Commit**

```bash
git add client/web/src/components/BrandLogo.tsx client/web/assets/template.html client/web/assets/pwa.webmanifest client/web/assets/images/brand
git commit -m "feat(client): replace caixun brand assets"
```

### Task 3: 入口页品牌与活动信息重做

**Files:**
- Create: `client/web/src/routes/Entry/components/EventBanner.tsx`
- Create: `client/web/src/routes/Entry/components/TrustLinks.tsx`
- Modify: `client/web/src/routes/Entry/LoginView.tsx`
- Modify: `client/web/src/routes/Entry/RegisterView.tsx`
- Modify: `client/web/src/routes/Entry/GuestView.tsx`
- Modify: `client/web/src/routes/Entry/ForgetPasswordView.tsx`

- [ ] **Step 1: 创建活动横幅组件**

```tsx
export const EventBanner = React.memo(() => (
  <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <div className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">當前活動</div>
    <div className="mt-1 text-base font-semibold text-white">第十屆交流會</div>
    <div className="mt-1 text-xs text-[rgba(255,255,255,0.64)]">日斗投資財富論壇</div>
  </div>
));
```

- [ ] **Step 2: 创建入口页底部信任链接**

```tsx
export const TrustLinks = React.memo(() => (
  <div className="mt-6 flex flex-wrap gap-3 text-xs text-[rgba(255,255,255,0.72)]">
    <Link to="/entry/about">關於我們</Link>
    <Link to="/entry/terms">用戶協議</Link>
    <Link to="/entry/privacy">隱私政策</Link>
    <Link to="/entry/community">社區公約</Link>
    <Link to="/entry/trust">安全與合規</Link>
  </div>
));
```

- [ ] **Step 3: 重写登录页头部信息**

```tsx
<BrandLogo alt="財訊" className="max-h-24 max-w-[80%]" />
<div className="font-extrabold text-2xl text-white">{BRAND_NAME_FULL}</div>
<div className="mt-2 text-sm text-[rgba(255,255,255,0.82)]">{BRAND_SUBTITLE}</div>
<EventBanner />
<TrustLinks />
```

- [ ] **Step 4: 重写注册页协议勾选文案**

```tsx
<span>
  我已閱讀並同意
  <button type="button">《用戶協議》</button>
  <button type="button">《隱私政策》</button>
</span>
<span className="block mt-1 text-[rgba(255,255,255,0.60)] font-medium">
  第十屆交流會名額註冊僅限特邀內部成員
</span>
```

- [ ] **Step 5: 在訪客與找回密碼页同步品牌头部**

```tsx
<BrandLogo alt="財訊" ... />
<div className="text-center">
  <div className="text-xl font-bold text-white">財訊</div>
  <div className="mt-2 text-sm text-[rgba(255,255,255,0.78)]">日斗投資財富論壇</div>
</div>
```

- [ ] **Step 6: 运行类型检查与构建**

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type && pnpm --dir /workspace/tailchat-source/client/web build:ci`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add client/web/src/routes/Entry
git commit -m "feat(client): rebrand entry views for caixun"
```

### Task 4: 正式關於、法律與信任頁

**Files:**
- Create: `client/web/src/routes/Entry/AboutView.tsx`
- Create: `client/web/src/routes/Entry/LegalView.tsx`
- Create: `client/web/src/routes/Entry/TrustView.tsx`
- Create: `client/web/src/routes/Entry/content/legal.tsx`
- Modify: `client/web/src/routes/Entry/index.tsx`

- [ ] **Step 1: 创建法律文案源文件**

```tsx
export const legalContent = {
  privacy: { title: '隱私政策', sections: [...] },
  terms: { title: '用戶協議', sections: [...] },
  community: { title: '社區公約', sections: [...] },
};
```

- [ ] **Step 2: 创建正式關於頁**

```tsx
export const AboutView = () => (
  <EntryPageLayout title="關於我們" subtitle="日斗投資財富論壇">
    <section>財訊 是面向內部會員的通訊與投資交流平台...</section>
    <section>公司主體：日斗投資諮詢有限公司</section>
    <section>當前活動：第十屆交流會</section>
  </EntryPageLayout>
);
```

- [ ] **Step 3: 创建法律承接页**

```tsx
export const LegalView = () => {
  const { type } = useParams();
  const content = legalContent[type as 'privacy' | 'terms' | 'community'];
  return <DocumentLayout title={content.title}>{renderSections(content.sections)}</DocumentLayout>;
};
```

- [ ] **Step 4: 创建信任中心页**

```tsx
export const TrustView = () => (
  <DocumentLayout title="財訊 · 安全與合規">
    <section>全站 TLS 1.3 + HSTS</section>
    <section>日本東京數據節點</section>
    <section>每日備份與傳輸/落盤加密</section>
    <section>SSL 加密 / 每日備份 / GDPR Ready</section>
  </DocumentLayout>
);
```

- [ ] **Step 5: 在入口路由中挂载**

```tsx
<Route path="/about" element={<AboutView />} />
<Route path="/privacy" element={<LegalView />} />
<Route path="/terms" element={<LegalView />} />
<Route path="/community" element={<LegalView />} />
<Route path="/trust" element={<TrustView />} />
```

- [ ] **Step 6: 运行入口路由构建验证**

Run: `pnpm --dir /workspace/tailchat-source/client/web build:ci`  
Expected: PASS and routes bundled successfully

- [ ] **Step 7: Commit**

```bash
git add client/web/src/routes/Entry
git commit -m "feat(client): add caixun legal and trust pages"
```

### Task 5: 设置中的關於与信任入口升级

**Files:**
- Modify: `client/web/src/components/modals/SettingsView/About.tsx`
- Modify: `client/web/src/components/modals/SettingsView/index.tsx`

- [ ] **Step 1: 升级关于内容**

```tsx
<Text className="font-bold text-xl">財訊</Text>
<Paragraph>日斗投資財富論壇 · 第十屆交流會</Paragraph>
<Paragraph>日斗投資諮詢有限公司</Paragraph>
```

- [ ] **Step 2: 在关于中增加正式页跳转**

```tsx
<a href="/entry/about" target="_blank" rel="noreferrer">查看完整關於我們</a>
<a href="/entry/trust" target="_blank" rel="noreferrer">查看安全與合規</a>
```

- [ ] **Step 3: 在设置侧栏中增加“協議與信任”分组**

```tsx
{
  type: 'group',
  title: t('協議與信任'),
  children: [
    { type: 'item', title: t('用戶協議'), content: <SettingsLinkPanel href="/entry/terms" /> },
    { type: 'item', title: t('隱私政策'), content: <SettingsLinkPanel href="/entry/privacy" /> },
    { type: 'item', title: t('社區公約'), content: <SettingsLinkPanel href="/entry/community" /> },
    { type: 'item', title: t('安全與合規'), content: <SettingsLinkPanel href="/entry/trust" /> },
  ],
}
```

- [ ] **Step 4: 运行类型检查**

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/web/src/components/modals/SettingsView
git commit -m "feat(client): add brand and trust links to settings"
```

### Task 6: 官網首頁與 SEO 同步承接

**Files:**
- Modify: `website/docusaurus.config.js`
- Modify: `website/src/components/HomepageHeader.tsx`
- Modify: `website/src/components/HomepageFeatures.tsx`
- Create: `website/src/pages/about.tsx`
- Create: `website/src/pages/privacy.tsx`
- Create: `website/src/pages/terms.tsx`
- Create: `website/src/pages/community.tsx`
- Create: `website/src/pages/trust.tsx`
- Create: `website/static/img/caixun-og.png`

- [ ] **Step 1: 修改 Docusaurus 站点配置**

```js
title: '財訊',
tagline: '日斗投資財富論壇第十屆交流會官方內部平台',
favicon: 'img/logo.svg',
themeConfig: {
  navbar: { title: '財訊' },
  footer: { copyright: `Copyright © ${new Date().getFullYear()} 日斗投資諮詢有限公司` },
}
```

- [ ] **Step 2: 官網首頁頭圖承接品牌**

```tsx
<h1>財訊</h1>
<p>日斗投資財富論壇 · 第十屆交流會</p>
<p>內部通訊、語音互動、觀點交流與投教陪伴</p>
```

- [ ] **Step 3: 新建官網文档型頁面**

```tsx
// website/src/pages/trust.tsx
export default function TrustPage() {
  return <Layout title="安全與合規 - 財訊">...</Layout>;
}
```

- [ ] **Step 4: 生成 OG 图并接入页面**

```text
尺寸：1200x630
文字：財訊 / 第十屆交流會 / 日斗投資財富論壇
```

- [ ] **Step 5: 构建官网**

Run: `pnpm --dir /workspace/tailchat-source/website build`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add website
git commit -m "feat(website): add caixun brand and trust pages"
```

### Task 7: 端到端验证与清理

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] **Step 1: 更新变更记录**

```md
- 将客户端展示品牌统一升级为「財訊」
- 新增關於我們、用戶協議、隱私政策、社區公約、安全與合規
- 落地第十屆交流會活動展示、品牌圖標與基礎 SEO
```

- [ ] **Step 2: 更新结构审计**

```md
- 品牌與信任展示已不再是零散素材，而是形成客戶端可見層完整閉環
```

- [ ] **Step 3: 执行最终验证**

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type && pnpm --dir /workspace/tailchat-source/client/web build:ci && pnpm --dir /workspace/tailchat-source/website build && pnpm --dir /workspace/tailchat-source build`  
Expected: PASS

- [ ] **Step 4: 检查无多余文件**

Run: `git -C /workspace/tailchat-source status --short`  
Expected: only intended tracked changes, no temp/debug files

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md docs/2026-05-01-structure-capability-audit.md
git commit -m "chore: close out caixun client brand rollout"
```
