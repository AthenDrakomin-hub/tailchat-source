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
import { EntryInput } from './components/Input';
import { SecondaryBtn } from './components/SecondaryBtn';
import { PrimaryBtn } from './components/PrimaryBtn';
import { pluginLoginAction } from '@/plugin/common';
import { BrandLogo } from '@/components/BrandLogo';
import { TrustLinks } from './components/TrustLinks';
import PeekingCharacters from './components/PeekingCharacters';

/**
 * 登录视图
 */
export const LoginView: React.FC = React.memo(() => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
    document.title = '財訊';
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
      navigate(decodeURIComponent(navRedirect));
    } else {
      navigate('/main');
    }
  }, [account, password, navRedirect, pathname, navigate]);

  const navToView = useNavToView();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value.length > 0) {
      setIsTyping(true);
    }
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
    setIsTyping(false);
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full relative">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="財訊" className="max-h-24 max-w-[80%]" />
      </div>

      {/* 标题 */}
      <div className="text-center mb-8">
        <div className="font-bold text-[28px] mobile:text-xl tracking-tight text-tc-text-primary">
          {BRAND_NAME_FULL}
        </div>
      </div>

      {/* 偷看密码的小人 */}
      <PeekingCharacters
        isPasswordFocused={isPasswordFocused}
        isPasswordVisible={showPassword}
        isTyping={isTyping}
      />

      <div>
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-tc-text-secondary">
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
        <div className="mb-4 relative">
          <div className="mb-2 text-sm font-medium text-tc-text-secondary">
            {t('密码')}
          </div>
          <EntryInput
            name="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="******"
            value={password}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
          />
          {/* 显示/隐藏密码按钮 */}
          <button
            type="button"
            className="absolute right-3 top-[38px] text-tc-text-tertiary hover:text-tc-text-secondary transition-colors"
            onClick={togglePasswordVisibility}
            style={{ top: 'calc(50% + 2px)' }}
          >
            <Icon
              icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
              className="w-5 h-5"
            />
          </button>
        </div>

        {loading === false && error && (
          <div className="flex justify-between mb-4">
            <p className="text-red-500 text-sm">{error.message}</p>
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

      <TrustLinks />
    </div>
  );
});
LoginView.displayName = 'LoginView';
