import { Icon } from 'tailchat-design';
import {
  forgetPassword,
  resetPassword,
  showToasts,
  t,
  useAsyncRequest,
} from 'tailchat-shared';
import React, { useState } from 'react';
import { string } from 'yup';
import { useNavToView } from './utils';
import { EntryInput } from './components/Input';
import { SecondaryBtn } from './components/SecondaryBtn';
import { PrimaryBtn } from './components/PrimaryBtn';
import { BrandLogo } from '@/components/BrandLogo';

/**
 * 登录视图
 */
export const ForgetPasswordView: React.FC = React.memo(() => {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [sendedEmail, setSendedEmail] = useState(false);

  const navToView = useNavToView();

  const [{ loading: sendEmailLoading }, handleSendEmail] =
    useAsyncRequest(async () => {
      await forgetPassword(email);
      setSendedEmail(true);
      showToasts(`已发送邮件到 ${email}`, 'success');
    }, [email]);

  const [{ loading }, handleResetPassword] = useAsyncRequest(async () => {
    await string()
      .email(t('邮箱格式不正确'))
      .required(t('邮箱不能为空'))
      .validate(email);

    await string()
      .min(6, t('密码不能低于6位'))
      .required(t('密码不能为空'))
      .validate(password);

    await string().length(6, t('OTP为6位数字')).validate(otp);

    await resetPassword(email, password, otp);

    showToasts(t('密码重置成功，现在回到登录页'), 'success');
    navToView('/entry/login');
  }, [email, password, otp, navToView]);

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="Logo" className="max-h-24 max-w-[80%]" />
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
            name="reg-email"
            placeholder={
              loginMethod === 'phone' ? t('请输入手机号') : t('请输入邮箱')
            }
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {!sendedEmail && (
          <PrimaryBtn loading={sendEmailLoading} onClick={handleSendEmail}>
            {t('向邮箱发送OTP')}
          </PrimaryBtn>
        )}

        {sendedEmail && (
          <>
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
                {t('OTP')}
              </div>
              <EntryInput
                name="forget-otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
                {t('新密码')}
              </div>
              <EntryInput
                name="forget-password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <PrimaryBtn loading={loading} onClick={handleResetPassword}>
              {t('重设密码')}
            </PrimaryBtn>
          </>
        )}

        <SecondaryBtn
          disabled={loading}
          onClick={() => navToView('/entry/login')}
        >
          <Icon icon="mdi:arrow-left" className="mr-1 inline" />
          {t('返回登录')}
        </SecondaryBtn>
      </div>
    </div>
  );
});
ForgetPasswordView.displayName = 'ForgetPasswordView';
