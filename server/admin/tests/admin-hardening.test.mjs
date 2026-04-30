import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/data/user/work/tailchat-source/server/admin/src';
const adminPackagePath = '/data/user/work/tailchat-source/server/admin/package.json';

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function readAdminPackage() {
  return JSON.parse(fs.readFileSync(adminPackagePath, 'utf8'));
}

function readAdminNodemon() {
  return JSON.parse(
    fs.readFileSync('/data/user/work/tailchat-source/server/admin/nodemon.json', 'utf8')
  );
}

test('站点配置不再使用“系统设置”这个资源名', () => {
  const app = read('client/App.tsx');
  const zh = read('client/i18n/zh.ts');

  assert.match(app, /<CustomRoute name="site-config"/);
  assert.doesNotMatch(app, /<CustomRoute name="system"/);
  assert.match(zh, /'site-config':\s*\{\s*name:\s*'站点配置'/);
});

test('系统设置页具备后端不可用时的降级态', () => {
  const route = read('server/router/config.ts');
  const page = read('client/routes/system/index.tsx');

  assert.match(route, /available:\s*false/);
  assert.match(route, /error:/);
  assert.match(page, /available === false/);
});

test('系统控制台在执行器未配置时显示降级提示而不是直接炸掉', () => {
  const page = read('client/routes/ops-control/index.tsx');

  assert.match(page, /executorConfigured/);
  assert.match(page, /未配置/);
});

test('防御控制系统在插件缺失时显示降级提示而不是直接炸掉', () => {
  const page = read('client/routes/defense-control/index.tsx');

  assert.match(page, /featureAvailable/);
  assert.match(page, /未安装|未接入|不可用/);
});

test('缓存管理兼容后端 message 和 msg 字段', () => {
  const page = read('client/routes/cache.tsx');

  assert.match(page, /data\.message/);
  assert.match(page, /data\.msg/);
});

test('插件页改名为“插件注册表”并保留独立路由', () => {
  const app = read('client/App.tsx');
  const zh = read('client/i18n/zh.ts');

  assert.match(app, /<CustomRoute name="plugin-registry"/);
  assert.doesNotMatch(app, /<CustomRoute name="plugin-permissions"/);
  assert.match(zh, /'plugin-registry':\s*\{\s*name:\s*'插件注册表'/);
});

test('Socket.IO 页面改名为“Socket.IO 诊断”', () => {
  const app = read('client/App.tsx');
  const zh = read('client/i18n/zh.ts');

  assert.match(app, /<CustomRoute name="socketio-diagnostic"/);
  assert.doesNotMatch(app, /<CustomRoute name="socketio"/);
  assert.match(zh, /'socketio-diagnostic':\s*\{\s*name:\s*'Socket\.IO 诊断'/);
});

test('插件注册表页具备统一降级卡片能力', () => {
  const page = read('client/routes/plugin-permissions.tsx');

  assert.match(page, /FeatureStatusCard/);
  assert.match(page, /registryUnavailable/);
});

test('Socket.IO 诊断页明确声明自己是诊断入口', () => {
  const page = read('client/routes/socketio.tsx');

  assert.match(page, /诊断入口|外部诊断工具/);
  assert.match(page, /FeatureStatusCard/);
});

test('管理端存在统一错误格式化工具并被关键页面接入', () => {
  const errorUtil = read('client/utils/admin-error.ts');
  const opsPage = read('client/routes/ops-control/index.tsx');
  const defensePage = read('client/routes/defense-control/index.tsx');
  const userPage = read('client/resources/user.tsx');
  const groupPage = read('client/resources/group.tsx');

  assert.match(errorUtil, /export function formatAdminError/);
  assert.match(opsPage, /formatAdminError/);
  assert.match(defensePage, /formatAdminError/);
  assert.match(userPage, /formatAdminError/);
  assert.match(groupPage, /formatAdminError/);
});

test('自定义 request 在 401/403 时会清理鉴权并跳回登录页', () => {
  const auth = read('client/auth.ts');
  const request = read('client/request.ts');

  assert.match(auth, /clearAdminAuthStorage/);
  assert.match(auth, /redirectToAdminLogin/);
  assert.match(request, /status === 401 \|\| status === 403/);
  assert.match(request, /clearAdminAuthStorage\(\)/);
  assert.match(request, /redirectToAdminLogin\(\)/);
  assert.match(request, /typeof token === 'string' && token/);
});

test('资源 httpClient 在 401/403 时也会清理鉴权并跳回登录页', () => {
  const auth = read('client/auth.ts');

  assert.match(auth, /const baseAuthHTTPClient = createAuthHttpClient/);
  assert.match(auth, /export const authHTTPClient: HTTPClient = async/);
  assert.match(auth, /status === 401 \|\| status === 403/);
  assert.match(auth, /clearAdminAuthStorage\(\)/);
  assert.match(auth, /redirectToAdminLogin\(\)/);
});

test('管理端存在统一能力状态类型并被站点配置页接入', () => {
  const featureState = read('client/utils/feature-state.ts');
  const systemPage = read('client/routes/system/index.tsx');

  assert.match(featureState, /export type FeatureState/);
  assert.match(systemPage, /FeatureState/);
});

test('tushan 创建编辑表单错误提示已接入更友好的错误提取补丁', () => {
  const rootPackage = fs.readFileSync('/data/user/work/tailchat-source/package.json', 'utf8');
  const patchFile = fs.readFileSync('/data/user/work/tailchat-source/patches/tushan@0.3.26.patch', 'utf8');

  assert.match(rootPackage, /"tushan@0\.3\.26": "patches\/tushan@0\.3\.26\.patch"/);
  assert.match(patchFile, /getErrorMessage/);
  assert.match(patchFile, /body\.error/);
  assert.match(patchFile, /operateFailed/);
});

test('防御控制页面会识别结构化失败返回并切换到不可用态', () => {
  const page = read('client/routes/defense-control/index.tsx');

  assert.match(page, /configResult/);
  assert.match(page, /auditLogsResult/);
  assert.match(page, /loadPanelData/);
  assert.match(page, /Promise\.all/);
  assert.match(page, /featureAvailable/);
});

test('站点配置页不再直接裸抛 String(err)', () => {
  const systemPage = read('client/routes/system/index.tsx');

  assert.doesNotMatch(systemPage, /Message\.error\(String\(err\)\)/);
  assert.match(systemPage, /formatAdminError/);
});

test('鉴权中间件与文件上传路由使用结构化错误响应', () => {
  const authMiddleware = read('server/middleware/auth.ts');
  const fileRouter = read('server/router/file.ts');

  assert.match(authMiddleware, /res\.status\(401\)\.json\(/);
  assert.match(fileRouter, /success:\s*false/);
  assert.match(fileRouter, /error:/);
});

test('network 页面具备统一降级卡片能力', () => {
  const page = read('client/routes/network/index.tsx');

  assert.match(page, /FeatureStatusCard/);
  assert.match(page, /networkUnavailable/);
});

test('analytics 页面具备主面板级降级提示能力', () => {
  const page = read('client/routes/analytics/index.tsx');

  assert.match(page, /FeatureStatusCard/);
  assert.match(page, /analyticsUnavailable/);
  assert.match(page, /data\.available === false|data\.success === false/);
});

test('system-notify 页面提交失败时接入统一错误格式化', () => {
  const page = read('client/routes/system/notify.tsx');

  assert.match(page, /formatAdminError/);
  assert.doesNotMatch(page, /Message\.error\(String\(err\)\)/);
});

test('api 路由中的 login 与系统通知使用结构化错误响应', () => {
  const apiRouter = read('server/router/api.ts');
  const networkRouter = read('server/router/network.ts');

  assert.match(apiRouter, /res\.status\(401\)\.json\(/);
  assert.match(apiRouter, /success:\s*false/);
  assert.match(networkRouter, /available:\s*false|success:\s*false/);
});

test('资源列表中间件对 count 失败具备保护，避免 dashboard 被数据库超时拖死', () => {
  const middleware = read('server/middleware/express-mongoose-ra-json-server/index.ts');

  assert.match(middleware, /let totalCount = '0'/);
  assert.match(middleware, /try \{/);
  assert.match(middleware, /catch \(err\)/);
});

test('资源 CRUD 中间件在数据库未就绪时快速失败，避免详情与删除动作慢等', () => {
  const middleware = read('server/middleware/express-mongoose-ra-json-server/index.ts');

  assert.match(middleware, /database not ready/);
  assert.match(middleware, /res\.status\(503\)\.json\(/);
  assert.match(middleware, /router\.get\(\s*'\/:id'/);
  assert.match(middleware, /router\.post\(\s*'\/'/);
  assert.match(middleware, /router\.put\(\s*'\/:id'/);
  assert.match(middleware, /router\.delete\(\s*'\/:id'/);
});

test('dashboard 相关统计与 analytics 接口使用结构化错误返回', () => {
  const apiRouter = read('server/router/api.ts');
  const analyticsRouter = read('server/router/analytics.ts');

  assert.match(apiRouter, /router\.get\('\/user\/count\/summary'/);
  assert.match(apiRouter, /success:\s*false/);
  assert.match(analyticsRouter, /success:\s*false/);
});

test('ops 路由保存失败时返回结构化 503，避免前端误判成功', () => {
  const opsRouter = read('server/router/ops.ts');

  assert.match(opsRouter, /res\.status\(503\)\.json\(/);
  assert.match(opsRouter, /success:\s*false/);
});

test('system-notify 在数据库未就绪且全员发送时快速失败', () => {
  const apiRouter = read('server/router/api.ts');

  assert.match(apiRouter, /scope === 'all'/);
  assert.match(apiRouter, /!isDbReady\(\)/);
  assert.match(apiRouter, /database not ready/);
});

test('file filesizeSum 在数据库未就绪时快速返回，避免文件页统计悬挂', () => {
  const fileRouter = read('server/router/file.ts');

  assert.match(fileRouter, /isDbReady/);
  assert.match(fileRouter, /totalSize:\s*0/);
  assert.match(fileRouter, /database not ready/);
});

test('user ban\/unban 在 broker 失败时返回结构化错误响应', () => {
  const apiRouter = read('server/router/api.ts');

  assert.match(apiRouter, /router\.post\('\/user\/ban'/);
  assert.match(apiRouter, /router\.post\('\/user\/unban'/);
  assert.match(apiRouter, /res\.status\(503\)\.json\(/);
  assert.match(apiRouter, /success:\s*false/);
});

test('存在统一的数据库就绪判断，并被 dashboard/analytics/资源中间件接入', () => {
  const dbGuard = read('server/utils/db-ready.ts');
  const apiRouter = read('server/router/api.ts');
  const analyticsRouter = read('server/router/analytics.ts');
  const middleware = read('server/middleware/express-mongoose-ra-json-server/index.ts');

  assert.match(dbGuard, /export function isDbReady/);
  assert.match(apiRouter, /isDbReady/);
  assert.match(analyticsRouter, /isDbReady/);
  assert.match(middleware, /isDbReady/);
});

test('管理端服务端入口依赖的 mongoose 和 dotenv 已在 package.json 中声明', () => {
  const pkg = readAdminPackage();

  assert.equal(pkg.dependencies.mongoose, '^6.1.1');
  assert.equal(pkg.dependencies.dotenv, '^10.0.0');
});

test('管理端开发启动链启用了 tsconfig-paths 与 tsconfig.server.json', () => {
  const pkg = readAdminPackage();
  const nodemon = readAdminNodemon();

  assert.equal(pkg.devDependencies['tsconfig-paths'], '^4.2.0');
  assert.match(
    nodemon.exec,
    /ts-node --transpile-only -r tsconfig-paths\/register -P \.\/tsconfig\.server\.json/
  );
});

test('本地联调环境文件已补齐最小 admin 与 mongo 配置', () => {
  const envFile = fs.readFileSync('/data/user/work/tailchat-source/server/.env', 'utf8');

  assert.match(envFile, /MONGO_URL=/);
  assert.match(envFile, /ADMIN_USER=/);
  assert.match(envFile, /ADMIN_PASS=/);
  assert.match(envFile, /SECRET=/);
});

test('admin broker 在本地 TCP 联调场景支持显式 peer 配置并关闭 UDP 自动发现', () => {
  const brokerFile = read('server/broker.ts');

  assert.match(brokerFile, /ADMIN_BROKER_TCP_PEERS/);
  assert.match(brokerFile, /udpDiscovery:\s*false/);
  assert.match(brokerFile, /useHostname:\s*false/);
  assert.match(brokerFile, /cacher:\s*null/);
});

test('moleculer tracing 补丁兼容 Node 22 的 performance.now this 绑定', () => {
  const patchFile = fs.readFileSync(
    '/data/user/work/tailchat-source/patches/moleculer@0.14.23.patch',
    'utf8'
  );

  assert.match(patchFile, /performance\.now\.bind\(performance\)/);
});

test('defense 插件在缺少 logger 与 shared secret 时不会阻塞完整主服务启动', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/server/plugins/com.ridou.defense-control/services/defense.service.ts',
    'utf8'
  );

  assert.match(file, /const logger = this\.logger \?\? console/);
  assert.match(file, /logger\.warn\(/);
  assert.match(file, /DEFENSE_SHARED_SECRET/);
});

test('socketio 在缺少 REDIS_URL 时会降级到本地模式而不是阻塞完整主服务启动', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/server/mixins/socketio.mixin.ts',
    'utf8'
  );

  assert.match(file, /SocketIO Redis adapter is disabled because REDIS_URL is not configured/);
  assert.match(file, /if\s*\(!this\.redis\)/);
  assert.match(file, /fetchSockets\(\)/);
  assert.doesNotMatch(
    file,
    /SocketIO service failed to start, environment variables are required: `REDIS_URL`/
  );
});

test('完整主服务 broker 支持固定 TCP 身份并在无 REDIS_URL 时关闭 Redis cacher', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/server/moleculer.config.ts',
    'utf8'
  );

  assert.match(file, /MAIN_BROKER_NODE_ID/);
  assert.match(file, /MAIN_BROKER_TCP_PORT/);
  assert.match(file, /udpDiscovery:\s*false/);
  assert.match(file, /brokerConfig\.cacher = null/);
});

test('基础服务在无 cacher 时会跳过 cleanActionCache，避免完整主服务启动期空指针', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/server/packages/sdk/src/services/base.ts',
    'utf8'
  );

  assert.match(file, /if\s*\(!this\.broker\.cacher\)\s*\{\s*console\.error\('Can not clean cache because no cacher existed\.'\);\s*return;\s*\}/s);
});

test('Minio mixin 在初始化失败时会降级记录错误而不是阻塞完整主服务启动', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/server/packages/sdk/src/services/mixins/minio.mixin.ts',
    'utf8'
  );

  assert.match(file, /Minio backend initialization failed, continue in degraded mode/);
  assert.doesNotMatch(file, /throw new MinioInitializationError\(e\.message\)/);
});

test('gateway CORS 白名单包含客户端 dev server 11011 端口', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/server/services/core/gateway.service.ts',
    'utf8'
  );

  assert.match(file, /http:\/\/localhost:11011/);
  assert.match(file, /http:\/\/127\.0\.0\.1:11011/);
});

test('客户端 webpack 将 react 与 react-dom 锁定到 React 18 单实例', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/client/web/build/webpack.config.ts',
    'utf8'
  );

  assert.match(file, /react\$: path\.resolve\(ROOT_PATH, 'node_modules\/react'\)/);
  assert.match(file, /'react-dom\$': path\.resolve\(ROOT_PATH, 'node_modules\/react-dom'\)/);
});

test('客户端 dev server 仅对 api/open/socket.io 做同源 proxy，避免 plugins 代理挂死本地启动', () => {
  const webpackFile = fs.readFileSync(
    '/data/user/work/tailchat-source/client/web/build/webpack.config.ts',
    'utf8'
  );
  const pkgFile = fs.readFileSync(
    '/data/user/work/tailchat-source/client/web/package.json',
    'utf8'
  );

  assert.match(webpackFile, /proxy:\s*\[/);
  assert.match(webpackFile, /context:\s*\['\/api', '\/open', '\/socket.io'\]/);
  assert.doesNotMatch(webpackFile, /context:\s*\[[^\]]*'\/plugins'[^\]]*\]/);
  assert.match(webpackFile, /target:\s*'http:\/\/localhost:11000'/);
  assert.doesNotMatch(pkgFile, /SERVICE_URL=http:\/\/127\.0\.0\.1:11000/);
});

test('客户端群组详情菜单会随权限状态更新，不能被空依赖 useMemo 冻结', () => {
  const file = fs.readFileSync(
    '/data/user/work/tailchat-source/client/web/src/components/modals/GroupDetail/index.tsx',
    'utf8'
  );

  assert.match(
    file,
    /useMemo\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[\s*groupId,[\s\S]*?allowManageConfig,[\s\S]*?allowManageUser,[\s\S]*?allowManagePanel,[\s\S]*?allowManageInvite,[\s\S]*?allowManageRoles,[\s\S]*?\]\s*\)/s
  );
  assert.doesNotMatch(file, /useMemo\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[\s*\]\s*\)/s);
});
