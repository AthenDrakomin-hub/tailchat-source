import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';

export const EntryInput: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  React.memo((props) => {
    return (
      <input
        {...props}
        style={{
          color: '#111827',
          caretColor: '#111827',
          WebkitTextFillColor: '#111827',
          ...props.style,
        }}
        className={clsx(
          'appearance-none rounded-2xl relative block w-full px-4 py-3 bg-white border border-[#d9d9d9] placeholder-[#9ca3af] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#07c160]/20 focus:border-[#07c160] focus:z-10 text-base mobile:text-sm transition-colors select-text shadow-none',
          props.className
        )}
      >
        {props.children}
      </input>
    );
  });
EntryInput.displayName = 'EntryInput';
