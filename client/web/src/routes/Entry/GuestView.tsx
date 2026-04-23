import { Spinner } from '@/components/Spinner';
import { useSearchParam } from '@/hooks/useSearchParam';
import { setUserJWT } from '@/utils/jwt-helper';
import { setGlobalUserLoginInfo } from '@/utils/user-helper';
import { Icon } from 'tailchat-design';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  createTemporaryUser,
  isValidStr,
  t,
  useAsyncRequest,
} from 'tailchat-shared';
import { string } from 'yup';
import { useNavToView } from './utils';
import { EntryInput } from './components/Input';
import { PrimaryBtn } from './components/PrimaryBtn';
import { SecondaryBtn } from './components/SecondaryBtn';
import { BrandLogo } from '@/components/BrandLogo';

export const GuestView: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const navToView = useNavToView();
  const navRedirect = useSearchParam('redirect');
  const [nickname, setNickname] = useState('');

  const [{ loading }, handleCreateTemporaryUser] = useAsyncRequest(async () => {
    await string().required(t('昵称不能为空')).max(16).validate(nickname);

    const data = await createTemporaryUser(nickname);

    setGlobalUserLoginInfo(data);
    await setUserJWT(data.token);

    if (isValidStr(navRedirect)) {
      navigate(decodeURIComponent(navRedirect));
    } else {
      navigate('/main');
    }
  }, [nickname, navigate, navRedirect]);

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <BrandLogo alt="Logo" className="max-h-24 max-w-[80%]" />
      </div>

      <div>
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-[rgba(255,255,255,0.82)]">
            {t('昵称')}
          </div>
          <EntryInput
            placeholder={t('想要让大家如何称呼你')}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <PrimaryBtn loading={loading} onClick={handleCreateTemporaryUser}>
          {t('立即进入')}
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
GuestView.displayName = 'GuestView';
