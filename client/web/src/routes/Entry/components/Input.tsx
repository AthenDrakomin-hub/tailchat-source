import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';

export const EntryInput: React.FC<InputHTMLAttributes<HTMLInputElement>> =
  React.memo((props) => {
    return (
      <input
        {...props}
        style={{
          color: '#fff',
          caretColor: '#fff',
          WebkitTextFillColor: '#fff',
          ...props.style,
        }}
        className={clsx(
          'appearance-none rounded-lg relative block w-full px-4 py-2.5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.14)] placeholder-[rgba(255,255,255,0.45)] text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] focus:z-10 text-base mobile:text-sm transition-colors',
          props.className
        )}
      >
        {props.children}
      </input>
    );
  });
EntryInput.displayName = 'EntryInput';
