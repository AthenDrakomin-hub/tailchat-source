# LiveKit 状态结构化输出与表格展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在「系统控制台」中以表格展示 LiveKit 状态（结构化字段），不再依赖前端解析 stdout 文本。

**Architecture:** 在宿主机 Ops Executor 增加 `GET /livekit/status` 输出结构化数据；Admin 后端透传；前端以 Tushan Table 展示并提供复制日志命令入口。

**Tech Stack:** Python3 (http.server), Node/TS (Express), React (tushan)

---

## Files

- Modify: [ops-executor.py](file:///workspace/scripts/ops-executor/ops-executor.py)
- Create: `scripts/ops-executor/test_livekit_status.py`
- Modify: [ops.ts](file:///workspace/server/admin/src/server/router/ops.ts)
- Modify: [OpsControlPanel](file:///workspace/server/admin/src/client/routes/ops-control/index.tsx)
- Modify: [ops-executor.md](file:///workspace/docs/deployment/ops-executor.md)（可选：补充 status 接口说明）

---

### Task 1: Ops Executor 输出 LiveKit 结构化状态

**Files:**
- Modify: `scripts/ops-executor/ops-executor.py`
- Create: `scripts/ops-executor/test_livekit_status.py`

- [ ] **Step 1: 写一个会失败的单测（先红）**

新增文件 `scripts/ops-executor/test_livekit_status.py`：

```python
import unittest


class TestParseLivekitStatus(unittest.TestCase):
    def test_parse_json_ps_running(self):
        from ops_executor import parse_compose_ps_json

        raw = [
            {
                "Name": "tailchat-livekit-1",
                "Service": "livekit",
                "State": "running",
                "Status": "Up 3 minutes",
                "Publishers": [
                    {"URL": "0.0.0.0:7880", "TargetPort": 7880, "Protocol": "tcp"},
                    {"URL": "0.0.0.0:7881", "TargetPort": 7881, "Protocol": "tcp"},
                ],
                "Image": "livekit/livekit-server:latest",
            }
        ]

        data = parse_compose_ps_json(raw)
        self.assertEqual(data["state"], "running")
        self.assertEqual(data["containerName"], "tailchat-livekit-1")
        self.assertEqual(data["image"], "livekit/livekit-server:latest")
        self.assertIn("0.0.0.0:7880->7880/tcp", data["ports"])
        self.assertEqual(data["uptime"], "Up 3 minutes")


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
python3 -m unittest scripts/ops-executor/test_livekit_status.py
```

Expected: FAIL（因为 `ops_executor` 模块或 `parse_compose_ps_json` 尚不存在）

- [ ] **Step 3: 最小实现（变绿）**

在 `ops-executor.py` 做两件事：

1) 抽取解析函数（供测试 import）
2) 增加 `GET /livekit/status`

核心实现要点：

```python
# 文件命名建议：将 ops-executor.py 重命名为 ops_executor.py（可选）
# 或者在同目录新增 ops_executor.py 并从 ops-executor.py import（保持兼容）

def parse_compose_ps_json(items):
    if not items:
        return {
            "ok": True,
            "service": "livekit",
            "state": "not_found",
            "containerName": "",
            "image": "",
            "ports": [],
            "uptime": "",
        }

    item = items[0] if isinstance(items, list) else items
    name = item.get("Name") or item.get("name") or ""
    state = item.get("State") or item.get("state") or ""
    status = item.get("Status") or item.get("status") or ""
    image = item.get("Image") or item.get("image") or ""
    pubs = item.get("Publishers") or item.get("publishers") or []
    ports = []
    for p in pubs:
        url = p.get("URL") or p.get("url")
        target = p.get("TargetPort") or p.get("targetPort")
        proto = p.get("Protocol") or p.get("protocol")
        if url and target and proto:
            ports.append(f"{url}->{target}/{proto}")

    normalized = "not_found"
    if isinstance(state, str):
        if state.lower() == "running":
            normalized = "running"
        elif state:
            normalized = "exited"

    return {
        "ok": True,
        "service": "livekit",
        "state": normalized,
        "containerName": name,
        "image": image,
        "ports": ports,
        "uptime": status,
    }
```

然后 `GET /livekit/status`：

- 首选执行：`docker compose -f docker-compose.yml ps --format json livekit`
- 若命令失败或输出不是 JSON：返回 `ok=false` + `output`（保持可排障）

最后补齐字段：

```python
data["logCommand"] = f"cd {PROJECT_DIR} && docker compose -f {COMPOSE_FILE} logs -n 200 livekit"
```

- [ ] **Step 4: 运行测试确认通过**

Run:
```bash
python3 -m unittest scripts/ops-executor/test_livekit_status.py
```

Expected: PASS

- [ ] **Step 5: 运行语法检查**

Run:
```bash
python3 -m py_compile scripts/ops-executor/ops-executor.py
```

- [ ] **Step 6: Commit**

```bash
git add scripts/ops-executor/ops-executor.py scripts/ops-executor/test_livekit_status.py
git commit -m "feat: ops executor livekit status"
```

---

### Task 2: Admin Server 增加 /ops/livekit/status 透传

**Files:**
- Modify: `server/admin/src/server/router/ops.ts`

- [ ] **Step 1: 写一个最小集成测试（可选）**

本仓库未提供 admin router 的测试基建，若不补测试，至少需本地 `tsc --noEmit`（见 Task 4）。

- [ ] **Step 2: 增加路由**

在 `ops.ts` 增加：

```ts
router.get('/livekit/status', auth(), async (req, res, next) => {
  try {
    const data = await getExecutor('/livekit/status');
    res.json(data);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add server/admin/src/server/router/ops.ts
git commit -m "feat: admin ops livekit status proxy"
```

---

### Task 3: 前端 Table 展示 + 复制日志命令

**Files:**
- Modify: `server/admin/src/client/routes/ops-control/index.tsx`

- [ ] **Step 1: 先改成请求 /ops/livekit/status（保持旧 textarea 为回退）**

将原 `GET /ops/livekit/ps` 替换为 `GET /ops/livekit/status`，并把返回值存入 `livekitStatus`。

- [ ] **Step 2: 引入 Table 并渲染默认列**

用 `tushan` 的 `Table` 渲染一个单行数据：

- 运行状态：根据 `state` 显示不同颜色的 `Typography.Text`
- ports：用 `ports.join('\n')` 或渲染为多行
- logCommand：提供一个 Button，点击复制到剪贴板

- [ ] **Step 3: 启停/重启后自动刷新**

保留原按钮逻辑，操作成功后调用刷新 status。

- [ ] **Step 4: Commit**

```bash
git add server/admin/src/client/routes/ops-control/index.tsx
git commit -m "feat: ops ui livekit status table"
```

---

### Task 4: 验证与收尾

**Files:**
- Modify: `docs/deployment/ops-executor.md`（可选）

- [ ] **Step 1: TypeScript 快速检查（尽量在 CI 里可跑）**

Run:
```bash
pnpm -C server/admin build:server
```

- [ ] **Step 2: 快速 grep 确认无 hardcode 旧域名（可选）**

Run:
```bash
grep -RIn "goodspage.cn\\|goodpages.cn" server/admin scripts/ops-executor docs/deployment/ops-executor.md || true
```

- [ ] **Step 3: 提交 docs（若有修改）并推送**

```bash
git push origin main
```

---

## Spec Coverage

- 覆盖 `state/containerName/image/ports/uptime/logCommand` 结构化字段
- 前端 Table 展示默认列，避免前端解析 stdout
