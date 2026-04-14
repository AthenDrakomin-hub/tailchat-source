import { Icon } from 'tailchat-design';
import {
  isValidStr,
  loginWithEmail,
  t,
  useAsyncFn,
  useGlobalConfigStore,
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
  const { serverName, disableGuestLogin, disableUserRegister } =
    useGlobalConfigStore((state) => ({
      serverName: state.serverName,
      disableGuestLogin: state.disableGuestLogin,
      disableUserRegister: state.disableUserRegister,
    }));

  useEffect(() => {
    tryAutoLogin()
      .then(() => {
        navigate('/main');
      })
      .catch(() => {});
  }, []);

  const [{ loading, error }, handleLogin] = useAsyncFn(async () => {
    await string()
      .required(t('账号不能为空'))
      .validate(email);

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
    <div className="w-full text-white relative">
      <div className="mb-8 text-3xl font-bold tracking-wider">
        {t('登录 {{serverName}}', {
          serverName: serverName || 'Tailchat',
        })}
      </div>

      <div className="flex bg-black bg-opacity-20 rounded-md p-1 mb-6">
        <button
          type="button"
          className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${loginMethod === 'phone' ? 'bg-[#0b192c] text-[#d4af37]' : 'text-gray-300 hover:text-white'}`}
          onClick={() => { setLoginMethod('phone'); setEmail(''); }}
        >
          {t('手机号')}
        </button>
        <button
          type="button"
          className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${loginMethod === 'email' ? 'bg-[#0b192c] text-[#d4af37]' : 'text-gray-300 hover:text-white'}`}
          onClick={() => { setLoginMethod('email'); setEmail(''); }}
        >
          {t('邮箱')}
        </button>
      </div>

      <div>
        <div className="mb-4">
          <div className="mb-2">{loginMethod === 'phone' ? t('手机号') : t('邮箱')}</div>
          <EntryInput
            name="login-email"
            placeholder={loginMethod === 'phone' ? t('请输入手机号') : t('请输入邮箱')}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2">{t('密码')}</div>
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
            <p className="text-red-500 text-sm">{error.message}</p>
            <div
              className="text-gray-200 cursor-pointer"
              onClick={() => navToView('/entry/forget')}
            >
              {t('忘记密码？')}
            </div>
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
