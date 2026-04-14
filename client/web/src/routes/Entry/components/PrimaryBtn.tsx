import { Spinner } from '@/components/Spinner';
import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';
import _omit from 'lodash/omit';

export const PrimaryBtn: React.FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
  }
> = React.memo((props) => {
  return (
    <button
      disabled={props.loading}
      {..._omit(props, ['loading'])}
      className={clsx(
        'w-full py-2 px-4 mb-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0b192c] hover:bg-[#d4af37] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] disabled:opacity-50 transition-colors',
        props.className
      )}
    >
      {props.loading && <Spinner />}
      {props.children}
    </button>
  );
});
PrimaryBtn.displayName = 'PrimaryBtn';
