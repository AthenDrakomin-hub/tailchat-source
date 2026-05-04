import React from 'react';
import { Tag } from 'antd';
import { t, UserBaseInfo } from 'tailchat-shared';
import { getUserIdentityTags } from './identityTags';

export const UserIdentityTags: React.FC<{
  userInfo: UserBaseInfo;
}> = React.memo((props) => {
  const tags = getUserIdentityTags(props.userInfo);

  if (tags.length === 0) {
    return null;
  }

  return (
    <>
      {tags.map((tag) => (
        <Tag key={tag} color="processing">
          {t(tag)}
        </Tag>
      ))}
    </>
  );
});

UserIdentityTags.displayName = 'UserIdentityTags';
