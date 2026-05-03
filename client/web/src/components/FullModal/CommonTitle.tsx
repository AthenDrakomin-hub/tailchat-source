import React, { PropsWithChildren } from 'react';

interface FullModalCommonTitleProps extends PropsWithChildren {
  extra?: React.ReactNode;
}
export const FullModalCommonTitle: React.FC<FullModalCommonTitleProps> =
  React.memo((props) => {
    return (
      <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-3">
        <div className="text-lg font-semibold text-[#111827]">{props.children}</div>
        <div>{props.extra}</div>
      </div>
    );
  });
FullModalCommonTitle.displayName = 'FullModalCommonTitle';
