import clsx from 'clsx';
import React, { ButtonHTMLAttributes } from 'react';

export const SecondaryBtn: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> =
  React.memo((props) => {
    return (
      <button
        {...props}
        className={clsx(
          'w-full py-2.5 px-4 border border-tc-border-default bg-tc-bg-base rounded-2xl text-sm font-medium text-tc-text-secondary hover:text-tc-text-primary hover:border-tc-border-active transition-colors focus:outline-none disabled:opacity-50',
          props.className
        )}
      >
        {props.children}
      </button>
    );
  });
SecondaryBtn.displayName = 'SecondaryBtn';
