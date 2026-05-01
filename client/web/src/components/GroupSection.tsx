import { Icon } from 'tailchat-design';
import React, { PropsWithChildren } from 'react';
import { useReducer } from 'react';

export const GroupSection: React.FC<
  PropsWithChildren<{
    header: string;
  }>
> = React.memo((props) => {
  const [isShow, switchShow] = useReducer((v) => !v, true);

  return (
    <div>
      <div
        className="flex items-center cursor-pointer py-1.5 px-2 text-[11px] font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400"
        onClick={switchShow}
      >
        <Icon
          className="mr-1 opacity-70"
          icon="mdi:chevron-right"
          rotate={isShow ? 45 : 0}
        />
        <div>{props.header}</div>
      </div>
      <div
        className="transition-all overflow-hidden space-y-1 pl-2.5 ml-2 border-l-2 border-black border-opacity-10 dark:border-white dark:border-opacity-10"
        style={{
          maxHeight: isShow ? 'var(--max-height)' : 0,
        }}
        ref={(ref) =>
          ref?.style.setProperty('--max-height', `${ref.scrollHeight}px`)
        }
      >
        {props.children}
      </div>
    </div>
  );
});
GroupSection.displayName = 'GroupSection';
