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
      className={clsx('text-center w-full flex flex-col items-center justify-center pt-20', props.className)}
      style={props.style}
    >
      <img className="w-48 h-48 m-auto mb-6 opacity-80" src={problemSvg} />

      <div className="text-lg font-medium text-gray-700 dark:text-gray-300 px-6 max-w-md">
        {props.text ?? t('出现了一些问题')}
      </div>
    </div>
  );
});
Problem.displayName = 'Problem';
