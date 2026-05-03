import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

export const RoleItem: React.FC<
  PropsWithChildren<{
    active: boolean;
    onClick?: () => void;
  }>
> = React.memo((props) => {
  return (
    <div
      className={clsx(
        'px-3 py-2.5 rounded-2xl cursor-pointer mb-1 text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-colors',
        {
          'bg-white text-gray-900 shadow-[0_4px_14px_rgba(15,23,42,0.06)]': props.active,
        }
      )}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
});
RoleItem.displayName = 'RoleItem';
