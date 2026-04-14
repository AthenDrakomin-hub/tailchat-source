import type { LanguageDetectorAsyncModule } from 'i18next';
import { useRef, useMemo, useCallback } from 'react';
import _isNil from 'lodash/isNil';
import { AllowedLanguage, setLanguage as setI18NLanguage } from './index';
import { getStorage, useStorage } from '../manager/storage';
import { LANGUAGE_KEY } from '../utils/consts';

export const defaultLanguage = 'zh-CN';

function getNavigatorLanguage(): AllowedLanguage {
  return 'zh-CN';
}

/**
 * Get current language
 */
async function getLanguage(): Promise<string> {
  // Ignore local storage and navigator language to force zh-CN
  return 'zh-CN';
}

/**
 * Current language management hook
 */
export function useLanguage() {
  const [language, { save }] = useStorage<AllowedLanguage>(
    LANGUAGE_KEY,
    defaultLanguage
  );

  const originLanguageRef = useRef<string>();

  const setLanguage = useCallback(
    async (newLanguage: AllowedLanguage) => {
      if (_isNil(originLanguageRef.current)) {
        originLanguageRef.current = language;
      }

      save(newLanguage);
      await setI18NLanguage(newLanguage);
    },
    [language, save]
  );

  const isChanged = useMemo(() => {
    if (_isNil(originLanguageRef.current)) {
      return false;
    }

    return originLanguageRef.current !== language;
  }, [language]);

  return { language, setLanguage, isChanged };
}

/**
 * Storage language
 * @param lang Language Code
 */
export async function saveLanguage(lang: string) {
  await getStorage().save(LANGUAGE_KEY, lang);
}

/**
 * i18n language detection middleware
 */
export const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback) => {
    try {
      const language = await getLanguage();
      callback(language);
    } catch (error) {
      callback(defaultLanguage);
    }
  },
  cacheUserLanguage(language) {
    try {
      saveLanguage(language);
    } catch (error) {}
  },
};
