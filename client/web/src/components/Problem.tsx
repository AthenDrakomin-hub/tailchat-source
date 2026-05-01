import React from 'react';
import problemSvg from '@assets/images/problem.svg';
import { t } from 'tailchat-shared';
import clsx from 'clsx';

interface ProblemProps {
  className?: string;
  style?: React.CSSProperties;
  text?: React.ReactNode;
}

/**
 * 问题页面占位
 */
export const Problem: React.FC<ProblemProps> = React.memo((props) => {
  return (
    <div
      className={clsx(
        'text-center w-full flex flex-col items-center justify-center pt-20 px-4',
        props.className
      )}
      style={props.style}
    >
      <img className="w-40 h-40 m-auto mb-6 opacity-80" src={problemSvg} />

      <div className="text-base font-medium text-gray-700 dark:text-gray-300 px-6 max-w-md leading-7">
        {props.text ?? t('出现了一些问题')}
      </div>
    </div>
  );
});
Problem.displayName = 'Problem';
