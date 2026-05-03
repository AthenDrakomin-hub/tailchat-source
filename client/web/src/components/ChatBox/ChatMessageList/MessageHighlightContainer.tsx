import React, { PropsWithChildren, useEffect, useMemo } from 'react';

interface Props extends PropsWithChildren {
  messageId: string;
}

/**
 * 消息高亮容器
 * 在消息项的外部包裹该容器，则对应的消息会高亮
 * 基于 [data-message-id="xxx"] 选择器
 */
export const MessageHighlightContainer: React.FC<Props> = React.memo(
  (props) => {
    const className = useMemo(
      () => `message-highlight-${String(Math.random()).substring(2)}`,
      []
    );
    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
.${className} [data-message-id="${props.messageId}"] {
  background: linear-gradient(90deg, rgba(250, 204, 21, 0.22), rgba(250, 204, 21, 0.08)) !important;
  box-shadow: inset 3px 0 0 #f59e0b;
  animation: tc-message-highlight-pulse 1.2s ease-in-out 2;
}

.dark .${className} [data-message-id="${props.messageId}"] {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.05)) !important;
  box-shadow: inset 3px 0 0 rgba(245, 158, 11, 0.9);
}

@keyframes tc-message-highlight-pulse {
  0% { transform: translateZ(0); }
  50% { filter: brightness(1.03); }
  100% { transform: translateZ(0); }
}
      `;
      style.setAttribute('highlight-message-id', props.messageId);

      document.body.append(style);

      return () => {
        style.remove();
      };
    }, [props.messageId, className]);

    return <div className={className}>{props.children}</div>;
  }
);
MessageHighlightContainer.displayName = 'MessageHighlightContainer';
