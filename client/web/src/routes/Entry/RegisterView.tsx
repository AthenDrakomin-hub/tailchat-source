import {
  isValidStr,
  model,
  registerWithEmail,
  showErrorToasts,
  showSuccessToasts,
  t,
  useAsyncFn,
  useAsyncRequest,
  getGlobalConfig,
  useWatch,
  BRAND_NAME_FULL,
  RISK_AGREE_LABEL,
  RISK_DECLARATION_FULL,
  RISK_DECLARATION_TITLE,
} from 'tailchat-shared';
import React, { useState } from 'react';
import { string } from 'yup';
import { Icon } from 'tailchat-design';
import { useNavigate } from 'react-router';
import { setUserJWT } from '../../utils/jwt-helper';
import { setGlobalUserLoginInfo } from '../../utils/user-helper';
import { useSearchParam } from '@/hooks/useSearchParam';
import { useNavToView } from './utils';
import { EntryInput } from './components/Input';
import { SecondaryBtn } from './components/SecondaryBtn';
import { PrimaryBtn } from './components/PrimaryBtn';
import { TipIcon } from '@/components/TipIcon';
import { BrandLogo } from '@/components/BrandLogo';
import { openModal, ModalWrapper } from '@/components/Modal';

/**
 * 注册视图
 */
export const RegisterView: React.FC = React.memo(() => {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [sendedEmail, setSendedEmail] = useState(false);
  const [customNickname, setCustomNickname] = useState(false);
  const [agreeRisk, setAgreeRisk] = useState(false);
  const navigate = useNavigate();
  const navRedirect = useSearchParam('redirect');

  const [{ loading, error }, handleRegister] = useAsyncFn(async () => {
    if (!agreeRisk) {
      showErrorToasts('请先阅读并同意《投资风险安全宣言》');
      return;
    }

    await string()
      .required(t('账号不能为空'))
      .max(40, t('账号最长限制40个字符'))
      .validate(email);

    await string()
      .min(6, t('密码不能低于6位'))
      .required(t('密码不能为空'))
      .max(40, t('密码最长限制40个字符'))
      .validate(password);

    const data = await registerWithEmail({
      email,
      password,
      nickname,
      emailOTP,
      orgCode,
    });

    setGlobalUserLoginInfo(data);
    await setUserJWT(data.token);

    if (isValidStr(navRedirect)) {
      navigate(decodeURIComponent(navRedirect));
    } else {
      navigate('/main');
    }
  }, [agreeRisk, email, nickname, password, emailOTP, orgCode, navRedirect]);

  const [{ loading: sendEmailLoading }, handleSendEmail] =
    useAsyncRequest(async () => {
      await model.user.verifyEmail(email);
      showSuccessToasts(t('发送成功, 请检查你的邮箱。'));
      setSendedEmail(true);
    }, [email]);

  useWatch([email, customNickname], () => {
    if (!customNickname) {
      setNickname(getEmailAddress(email));
    }
  });

  const navToView = useNavToView();
  const openRiskDeclaration = () => {
    openModal(
      <ModalWrapper title={RISK_DECLARATION_TITLE}>
        <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {RISK_DECLARATION_FULL}
        </div>
      </ModalWrapper>,
      { closable: true }
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="Logo" className="max-h-24 max-w-[80%]" />
      </div>

      <div className="text-center mb-8">
        <div className="font-extrabold text-2xl mobile:text-xl tracking-wide text-white">
          {BRAND_NAME_FULL}
        </div>
        <div className="mt-2 text-sm text-[rgba(255,255,255,0.72)]">
          注册仅限特邀内部成员
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
            name="reg-email"
            placeholder={
              loginMethod === 'phone' ? t('请输入手机号') : t('请输入邮箱')
            }
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4 relative">
          <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
            {t('组织代码')}
          </div>
          <EntryInput
            name="reg-orgcode"
            placeholder={t('请输入组织代码')}
            type="text"
            value={orgCode}
            onChange={(e) => setOrgCode(e.target.value)}
          />
        </div>

        <div className="mb-4 relative">
          <div className="mb-2 flex items-center text-sm font-medium text-[rgba(255,255,255,0.82)]">
            <span className="mr-1">{t('昵称')}</span>
            <TipIcon content={t('后续在用户设置中可以随时修改')} />
          </div>
          <EntryInput
            name="reg-nickname"
            type="text"
            disabled={!customNickname}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <Icon
            className="absolute bottom-1.5 right-1.5 w-9 h-9 p-2 rounded cursor-pointer bg-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.16)] text-[rgba(255,255,255,0.70)] z-10 transition-colors"
            icon={customNickname ? 'mdi:pencil-off' : 'mdi:pencil'}
            onClick={() =>
              setCustomNickname((customNickname) => !customNickname)
            }
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
            {t('密码')}
          </div>
          <EntryInput
            name="reg-password"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-[rgba(255,255,255,0.75)] mb-4 select-none">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={agreeRisk}
            onChange={(e) => setAgreeRisk(e.target.checked)}
          />
          <div className="flex flex-col">
            <span>
              {RISK_AGREE_LABEL}
              <button
                type="button"
                className="ml-2 underline opacity-90 hover:opacity-100 text-[#d4af37]"
                onClick={openRiskDeclaration}
              >
                查看
              </button>
            </span>
            <span className="block mt-1 text-[rgba(255,255,255,0.60)] font-medium">
              日斗投资财富交流会学习名额注册仅限特邀内部成员
            </span>
          </div>
        </label>

        {error && <p className="text-red-300 text-sm mb-4">{error.message}</p>}

        <PrimaryBtn loading={loading} onClick={handleRegister}>
          {t('注册账号')}
        </PrimaryBtn>

        <SecondaryBtn
          className="text-left"
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
RegisterView.displayName = 'RegisterView';

function getEmailAddress(email: string) {
  return email.split('@')[0];
}
