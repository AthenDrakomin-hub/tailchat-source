import { Icon } from 'tailchat-design';
import {
  isValidStr,
  loginWithEmail,
  t,
  useAsyncFn,
  useGlobalConfigStore,
  BRAND_NAME_FULL,
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

/**
 * 登录视图
 */
export const LoginView: React.FC = React.memo(() => {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
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
    tryAutoLogin()
      .then(() => {
        navigate('/main');
      })
      .catch(() => {});
  }, []);

  const [{ loading, error }, handleLogin] = useAsyncFn(async () => {
    await string().required(t('账号不能为空')).validate(email);

    await string()
      .min(6, t('密码不能低于6位'))
      .required(t('密码不能为空'))
      .validate(password);

    const data = await loginWithEmail(email, password);

    setGlobalUserLoginInfo(data);
    await setUserJWT(data.token);

    if (isValidStr(navRedirect) && navRedirect !== pathname) {
      // 增加非当前状态判定避免循环
      navigate(decodeURIComponent(navRedirect));
    } else {
      navigate('/main');
    }
  }, [email, password, navRedirect, pathname, navigate]);

  const navToView = useNavToView();

  return (
    <div className="w-full relative">
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="Logo" className="max-h-24 max-w-[80%]" />
      </div>

      <div className="text-center mb-8">
        <div className="font-extrabold text-2xl mobile:text-xl tracking-wide text-white">
          {BRAND_NAME_FULL}
        </div>
        <div className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">
          价值投资交流 · 风控 · 长期主义
        </div>
      </div>

      <div className="flex rounded-lg p-1 mb-6 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.10)] backdrop-blur">
        <button
          type="button"
          className={`flex-1 py-2 text-sm rounded-md transition-all ${
            loginMethod === 'phone'
              ? 'bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-[#0b192c] font-semibold shadow-sm'
              : 'text-[rgba(255,255,255,0.75)] hover:text-white'
          }`}
          onClick={() => {
            setLoginMethod('phone');
            setEmail('');
          }}
        >
          {t('手机号')}
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm rounded-md transition-all ${
            loginMethod === 'email'
              ? 'bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-[#0b192c] font-semibold shadow-sm'
              : 'text-[rgba(255,255,255,0.75)] hover:text-white'
          }`}
          onClick={() => {
            setLoginMethod('email');
            setEmail('');
          }}
        >
          {t('邮箱')}
        </button>
      </div>

      <div>
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
            {loginMethod === 'phone' ? t('手机号') : t('邮箱')}
          </div>
          <EntryInput
            name="login-email"
            placeholder={
              loginMethod === 'phone' ? t('请输入手机号') : t('请输入邮箱')
            }
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
    </div>
  );
});
LoginView.displayName = 'LoginView';
