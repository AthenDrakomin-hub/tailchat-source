import { Select, SelectProps } from 'antd';
import React, { useCallback } from 'react';
import { useLanguage } from 'tailchat-shared';
import type { AllowedLanguage } from 'tailchat-shared';

type LanguageSelectProps = Omit<SelectProps, 'value' | 'onChange'>;

/**
 * 语言切换选择框
 */
export const LanguageSelect: React.FC<LanguageSelectProps> = React.memo(
  (props) => {
    const { language, setLanguage } = useLanguage();

    const handleChangeLanguage = useCallback(
      (newLang: AllowedLanguage) => {
        setLanguage(newLang);
      },
      [setLanguage]
    );

    return (
      <Select
        style={{ width: 280 }}
        size="large"
        {...props}
        value={language}
        onChange={handleChangeLanguage}
      >
        <Select.Option value="zh-CN">简体中文</Select.Option>
        <Select.Option value="en-US">English</Select.Option>
      </Select>
    );
  }
);
LanguageSelect.displayName = 'LanguageSelect';
