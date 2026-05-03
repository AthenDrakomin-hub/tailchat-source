import {
  getMessageTextDecorators,
  pluginChatInputButtons,
} from '@/plugin/common';
import { isEnterHotkey } from '@/utils/hot-key';
import React, { useRef, useState } from 'react';
import { ChatInputAddon } from './Addon';
import { ClipboardHelper } from './clipboard-helper';
import { ChatInputActionContext, useChatInputMentionsContext } from './context';
import { uploadMessageImage } from './utils';
import { ChatInputBoxInput } from './input';
import {
  getCachedUserInfo,
  isValidStr,
  SendMessagePayloadMeta,
  useEvent,
  useSharedEventHandler,
} from 'tailchat-shared';
import { ChatInputEmotion } from './Emotion';
import { MuteAllButton } from './MuteAllButton';
import _uniq from 'lodash/uniq';
import { ChatDropArea } from './ChatDropArea';
import { Icon } from 'tailchat-design';
import { usePasteHandler } from './usePasteHandler';

interface ChatInputBoxProps {
  groupId?: string;
  panelId?: string;
  onSendMsg: (msg: string, meta?: SendMessagePayloadMeta) => Promise<void>;
}
/**
 * 通用聊天输入框
 */
export const ChatInputBox: React.FC<ChatInputBoxProps> = React.memo((props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const { disabled } = useChatInputMentionsContext();
  const { runPasteHandlers, pasteHandlerContainer } = usePasteHandler();

  const sendMessage = useEvent(
    async (msg: string, meta?: SendMessagePayloadMeta) => {
      await props.onSendMsg(msg, meta);
      setMessage('');
      inputRef.current?.focus();
    }
  );

  const handleSendMsg = useEvent(() => {
    sendMessage(message, {
      mentions: _uniq(mentions), // 发送前去重
    });
  });

  const appendMsg = useEvent((append: string) => {
    setMessage(message + append);

    inputRef.current?.focus();
  });

  const handleKeyDown = useEvent(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (isEnterHotkey(e.nativeEvent)) {
        e.preventDefault();
        handleSendMsg();
      }
    }
  );

  const handlePaste = useEvent(
    (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const el: HTMLTextAreaElement | HTMLInputElement = e.currentTarget;
      const helper = new ClipboardHelper(e);

      if (!el.value) {
        // 当没有任何输入内容时才会执行handler
        const handlers = helper.matchPasteHandler();
        if (handlers.length > 0) {
          // 弹出选择框
          runPasteHandlers(handlers, e, {
            sendMessage,
            applyMessage: setMessage,
          });
          return;
        }
      }

      // If not match any paste handler or not paste without any input, fallback to image paste checker
      const image = helper.hasImage();
      if (image) {
        // 上传图片
        e.preventDefault();
        uploadMessageImage(image).then(({ url, width, height }) => {
          props.onSendMsg(
            getMessageTextDecorators().image(url, { width, height })
          );
        });
      }
    }
  );

  useSharedEventHandler('replyMessage', async (payload) => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (payload && isValidStr(payload?.author)) {
        const userInfo = await getCachedUserInfo(payload.author);
        setMessage(
          `${getMessageTextDecorators().mention(
            payload.author,
            userInfo.nickname
          )} ${message}`
        );
      }
    }
  });

  return (
    <ChatInputActionContext.Provider
      value={{
        message,
        setMessage,
        sendMsg: props.onSendMsg,
        appendMsg,
      }}
    >
      <div className="px-4 py-2 min-w-0 mobile:px-3 mobile:py-2">
        <div className="bg-white dark:bg-[#2b2b2b] flex min-w-0 rounded-[24px] items-center relative border border-black/5 dark:border-white/10 shadow-none">
          {/* This w-0 is magic to ensure show mention and long text */}
          <div className="flex-1 w-0">
            <ChatInputBoxInput
              inputRef={inputRef}
              value={message}
              onChange={(message, mentions) => {
                setMessage(message);
                setMentions(mentions);
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>

          {pasteHandlerContainer}

          {!disabled && (
            <div className="px-3 mobile:px-2 flex flex-shrink-0 space-x-1 items-center">
              {pluginChatInputButtons.map((item, i) =>
                React.cloneElement(item.render(), {
                  key: `plugin-chatinput-btn#${i}`,
                })
              )}

              <ChatInputEmotion />
              <MuteAllButton groupId={props.groupId} panelId={props.panelId} />

              {message ? (
                <Icon
                  icon="mdi:send-circle-outline"
                  className="text-[28px] text-[#07c160] cursor-pointer hover:text-[#06ad56] transition-colors"
                  onClick={handleSendMsg}
                />
              ) : (
                <ChatInputAddon />
              )}
            </div>
          )}
        </div>
        {!disabled && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-[11px] leading-5 text-gray-400 dark:text-gray-500 mobile:hidden">
            <span>Enter 发送</span>
            <span>图片拖拽 / 粘贴</span>
          </div>
        )}
      </div>

      {!disabled && <ChatDropArea />}
    </ChatInputActionContext.Provider>
  );
});
ChatInputBox.displayName = 'ChatInputBox';
