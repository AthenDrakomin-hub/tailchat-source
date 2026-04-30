# Admin Runtime Baseline Guide

## 目标

把本轮联调依赖的最小测试基线恢复到一个稳定、可复验的状态，避免下次联调被历史邀请码、成员状态或密码漂移影响。

## 基线状态

执行重置后，应恢复到以下状态：

### 测试账号

- `owner@example.com`
  - username: `owner`
  - nickname: `Owner`
  - discriminator: `0001`
  - systemRole: `teacher`
- `member@example.com`
  - username: `member`
  - nickname: `Member`
  - discriminator: `0002`
  - systemRole: `student`

### 测试密码

- 两个账号统一恢复为：
  - `123456789`

### 测试群组

- group id: `507f191e810c19729de860eb`
- name: `Test Group Full Main`
- description: `Updated via admin resource API under full main service`
- owner: `owner@example.com`
- members:
  - `owner@example.com`
  - `member@example.com`
- member count:
  - `2`

### 邀请码

- 清空该测试群组的残留邀请码

## 重置脚本

文件：

- `scripts/reset-admin-runtime-baseline.js`

用途：

- 统一测试账号密码
- 恢复测试群组名称、描述、owner 与成员列表
- 清理该测试群组的历史邀请码

## 使用方式

在仓库根目录运行：

```bash
node scripts/reset-admin-runtime-baseline.js
```

如果你需要覆盖默认密码：

```bash
BASELINE_PASSWORD=your-password node scripts/reset-admin-runtime-baseline.js
```

## 建议何时执行

建议在这些场景执行一次：

- 做新一轮 admin / client 联调之前
- 做完成员移除 / invite 加回验证之后
- 发现登录失败、成员数不对、邀请码污染时
- 准备把环境交给别人继续复验时

## 当前验证结果

脚本已经在当前环境实跑通过，最新一次结果为：

- 群组成员数恢复为 `2`
- 删除了 `1` 条残留邀请码
- 当前剩余邀请码数为 `0`

## 说明

这个脚本只处理本轮联调明确依赖的对象：

- 2 个测试用户
- 1 个测试群组
- 该群组的邀请码

它不会主动清理其它业务数据。这样能降低误伤范围，也更适合持续联调使用。
