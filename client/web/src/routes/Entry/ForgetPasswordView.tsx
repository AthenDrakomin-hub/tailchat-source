import { Icon } from 'tailchat-design';
import { BRAND_NAME_FULL, BRAND_SUBTITLE, t } from 'tailchat-shared';
import React, { useEffect } from 'react';
import { useNavToView } from './utils';
import { SecondaryBtn } from './components/SecondaryBtn';
import { BrandLogo } from '@/components/BrandLogo';
import { EventBanner } from './components/EventBanner';
import { TrustLinks } from './components/TrustLinks';

/**
 * 登录视图
 */
export const ForgetPasswordView: React.FC = React.memo(() => {
  const navToView = useNavToView();
  useEffect(() => {
    document.title = '找回密碼 - 財訊';
  }, []);

  return (
    <div className="w-full">
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
      </div>

      <EventBanner />

      <div>
        <div className="mb-4 text-sm text-[rgba(255,255,255,0.82)] leading-relaxed">
          {t(
            '当前版本不提供“邮箱/手机号找回密码”。请联系管理员重置密码，或使用已绑定的账号密码登录。'
          )}
        </div>

        <SecondaryBtn onClick={() => navToView('/entry/login')}>
          <Icon icon="mdi:arrow-left" className="mr-1 inline" />
          {t('返回登录')}
        </SecondaryBtn>
      </div>

      <TrustLinks />
    </div>
  );
});
ForgetPasswordView.displayName = 'ForgetPasswordView';
