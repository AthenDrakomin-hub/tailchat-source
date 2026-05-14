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
        'w-full py-3.5 px-4 mb-3 border border-transparent text-base font-semibold rounded-2xl text-white bg-tc-primary hover:bg-tc-primary-hover focus:outline-none focus:ring-2 focus:ring-tc-primary-light disabled:opacity-50 shadow-none transition-colors duration-200 ease-in-out',
        props.className
      )}
    >
      {props.loading && <Spinner />}
      {props.children}
    </button>
  );
});
PrimaryBtn.displayName = 'PrimaryBtn';
