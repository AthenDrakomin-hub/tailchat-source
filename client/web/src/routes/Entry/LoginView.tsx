import { Icon } from 'tailchat-design';
import {
  isValidStr,
  loginWithEmail,
  t,
  useAsyncFn,
  useGlobalConfigStore,
  BRAND_NAME_FULL,
  BRAND_SUBTITLE,
  BRAND_COMPANY,
} from 'tailchat-shared';
import React, { useEffect, useState } from 'react';
import { string } from 'yup';
import { useLocation, useNavigate } from 'react-router';
import { setUserJWT } from '../../utils/jwt-helper';
import { setGlobalUserLoginInfo, tryAutoLogin } from '../../utils/user-helper';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useNavToView } from './utils';
import { IconBtn } from '@/components/IconBtn';
import { openModal } from '@/components/Modal';
import { ServiceUrlSettings } from '@/components/modals/ServiceUrlSettings';
import { LanguageSelect } from '@/components/LanguageSelect';
import { EntryInput } from './components/Input';
import { SecondaryBtn } from './components/SecondaryBtn';
import { PrimaryBtn } from './components/PrimaryBtn';
import { pluginLoginAction } from '@/plugin/common';
import { BrandLogo } from '@/components/BrandLogo';
import { useMemo } from 'react';
import { EventBanner } from './components/EventBanner';
import { TrustLinks } from './components/TrustLinks';

const QUOTES = [
  '研究先於交易，紀律先於情緒。',
  '看得懂，才值得重倉；看不懂，就先等待。',
  '長期主義不是口號，而是對風險與價值的反覆驗證。',
  '真正的投資交流，不是跟風，而是建立自己的判斷力。',
  '在市場喧囂時保持克制，往往比做出動作更難也更重要。',
];

/**
 * 登录视图
 */
export const LoginView: React.FC = React.memo(() => {
  const dailyQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const navRedirect = useSearchParam('redirect');
  const { pathname } = useLocation();
  const { disableGuestLogin, disableUserRegister } = useGlobalConfigStore(
    (state) => ({
      disableGuestLogin: state.disableGuestLogin,
      disableUserRegister: state.disableUserRegister,
    })
  );

  useEffect(() => {
    document.title = '財訊 - 第十屆投資財富交流會';
    tryAutoLogin()
      .then(() => {
        navigate('/main');
      })
      .catch(() => {});
  }, []);

  const [{ loading, error }, handleLogin] = useAsyncFn(async () => {
    await string().required(t('账号不能为空')).validate(account);

    await string()
      .min(6, t('密码不能低于6位'))
      .required(t('密码不能为空'))
      .validate(password);

    const data = await loginWithEmail(account, password);

    setGlobalUserLoginInfo(data);
    await setUserJWT(data.token);

    if (isValidStr(navRedirect) && navRedirect !== pathname) {
      // 增加非当前状态判定避免循环
      navigate(decodeURIComponent(navRedirect));
    } else {
      navigate('/main');
    }
  }, [account, password, navRedirect, pathname, navigate]);

  const navToView = useNavToView();

  return (
    <div className="w-full relative">
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="財訊" className="max-h-24 max-w-[80%]" />
      </div>

      <div className="text-center mb-8">
        <div className="font-extrabold text-2xl mobile:text-xl tracking-wide text-white">
          {BRAND_NAME_FULL}
        </div>
        <div className="mt-2 text-sm text-[rgba(255,255,255,0.82)]">
          {BRAND_SUBTITLE}
        </div>
        <div className="mt-3 text-sm text-[rgba(255,255,255,0.85)] italic font-serif">
          "{dailyQuote}"
        </div>
      </div>

      <EventBanner />

      <div className="mb-6 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.06)] px-4 py-4 backdrop-blur-sm">
        <div className="text-sm font-semibold text-white">客户端使用建议</div>
        <div className="mt-3 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3">
            <div className="text-xs text-[rgba(255,255,255,0.62)]">Web</div>
            <div className="mt-1 text-sm font-medium text-white">当前主入口</div>
            <div className="mt-1 text-xs leading-5 text-[rgba(255,255,255,0.68)]">
              推荐先通过 Web 完成内测主链路体验。
            </div>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3">
            <div className="text-xs text-[rgba(255,255,255,0.62)]">Desktop</div>
            <div className="mt-1 text-sm font-medium text-white">适合长期使用</div>
            <div className="mt-1 text-xs leading-5 text-[rgba(255,255,255,0.68)]">
              适合盯盘、群讨论常驻与多会话并行使用。
            </div>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3">
            <div className="text-xs text-[rgba(255,255,255,0.62)]">Mobile</div>
            <div className="mt-1 text-sm font-medium text-white">持续完善中</div>
            <div className="mt-1 text-xs leading-5 text-[rgba(255,255,255,0.68)]">
              移动端入口已进入内测优化阶段，后续继续推进商城上架准备。
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-[rgba(255,255,255,0.62)]">
          下载与平台说明：
          <a
            className="ml-1 underline underline-offset-4 hover:text-white"
            href="https://tailchat.msgbyte.com/downloads"
            target="_blank"
            rel="noreferrer"
          >
            查看客户端分发页
          </a>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
            {t('账号')}
          </div>
          <EntryInput
            name="login-email"
            placeholder={t('请输入账号')}
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
            {t('密码')}
          </div>
          <EntryInput
            name="login-password"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {loading === false && error && (
          <div className="flex justify-between mb-4">
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        )}

        <PrimaryBtn loading={loading} onClick={handleLogin}>
          {t('登录')}
        </PrimaryBtn>

        {!disableUserRegister && (
          <SecondaryBtn
            disabled={loading}
            onClick={() => navToView('/entry/register')}
          >
            {t('注册账号')}
            <Icon icon="mdi:arrow-right" className="ml-1 inline" />
          </SecondaryBtn>
        )}

        {pluginLoginAction.map((item) => {
          const { name, component: Component } = item;

          return <Component key={name} />;
        })}
      </div>

      <div className="mt-6 text-xs text-[rgba(255,255,255,0.55)] leading-6">
        <div>{BRAND_COMPANY}</div>
        <div>TLS 1.3 傳輸保護 · 日本數據節點部署</div>
      </div>
      <TrustLinks />
    </div>
  );
});
LoginView.displayName = 'LoginView';
