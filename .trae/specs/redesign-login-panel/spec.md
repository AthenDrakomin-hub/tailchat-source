# 优化登录页左侧面板样式 Spec

## 为什么 (Why)
用户上传的 Logo 带有非透明的浅色背景，而当前登录页左侧面板使用的是深色渐变背景（深灰/深蓝）。这导致 Logo 在深色背景上显得非常突兀（像贴上去的补丁），整个页面风格不协调，用户体验较差。

## 做了什么更改 (What Changes)
- 将左侧登录面板的背景颜色从深色渐变修改为与 Logo 背景一致的浅色（如纯白或浅灰），或者使用 `mix-blend-mode: multiply` 使其完美融合。
- 由于面板背景变为浅色，将左侧面板的所有文字颜色（包括标题、提示、副标题等）修改为深色（如 `text-gray-800`）。
- 调整输入框（`EntryInput`）的背景和文字颜色，使其适应浅色主题。
- 调整“手机号/邮箱”切换标签和辅助按钮的样式，确保在浅色背景下具有良好的对比度和辨识度。
- 为左侧面板添加适当的阴影或边界，使其与右侧高清背景图平滑过渡。

## 影响范围 (Impact)
- Affected code:
  - `client/web/src/routes/Entry/index.tsx` (左侧面板背景和基础文字颜色)
  - `client/web/src/routes/Entry/LoginView.tsx` (切换标签、文字颜色)
  - `client/web/src/routes/Entry/components/Input.tsx` (输入框样式)
  - `client/web/src/routes/Entry/components/PrimaryBtn.tsx` / `SecondaryBtn.tsx` (按钮样式调整)

## 增加的需求 (ADDED Requirements)
### Requirement: 浅色主题登录面板
系统应当提供一个与企业 Logo 背景色相匹配的浅色左侧登录面板，以确保品牌标识的视觉统一性。

#### Scenario: 成功加载页面
- **WHEN** 用户访问登录页
- **THEN** 左侧面板显示为浅色背景，Logo 无缝融入，文字、输入框和按钮均清晰可见。

## 修改的需求 (MODIFIED Requirements)
### Requirement: 登录表单样式自适应
原有的深色表单组件（白字、半透明黑底）需修改为适应浅色背景的样式（深字、浅灰底或边框线）。