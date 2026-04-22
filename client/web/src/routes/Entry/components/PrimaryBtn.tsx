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
        'w-full py-3 px-4 mb-4 border border-transparent text-base font-bold rounded-md text-gray-900 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] hover:from-[#e5c158] hover:to-[#fff6c1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] disabled:opacity-50 shadow-md transition-all duration-300 ease-in-out',
        props.className
      )}
    >
      {props.loading && <Spinner />}
      {props.children}
    </button>
  );
});
PrimaryBtn.displayName = 'PrimaryBtn';
