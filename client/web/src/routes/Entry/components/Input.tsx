import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';

export const EntryInput: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  React.memo((props) => {
    const { children, ...restProps } = props;
    return (
      <input
        {...restProps}
        style={{
          color: 'var(--tc-text-primary)',
          caretColor: 'var(--tc-primary)',
          WebkitTextFillColor: 'var(--tc-text-primary)',
          ...props.style,
        }}
        className={clsx(
          'appearance-none rounded-2xl relative block w-full px-4 py-3 bg-tc-bg-base border border-tc-border-default placeholder-tc-text-tertiary text-tc-text-primary focus:outline-none focus:ring-2 focus:ring-tc-primary-light focus:border-tc-primary focus:z-10 text-base mobile:text-sm transition-colors select-text shadow-none',
          props.className
        )}
      />
    );
  });
EntryInput.displayName = 'EntryInput';
