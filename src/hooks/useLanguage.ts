import { useEffect, useState } from 'react';
import i18n from '../i18n';
import { LANGUAGE_STORAGE_KEY, type Locale } from '../lib/preferences';
import { readStorage, writeStorage } from '../lib/storage';

function getInitialLanguage(): Locale {
  const stored = readStorage(LANGUAGE_STORAGE_KEY);
  if (stored === 'zh-CN' || stored === 'en') {
    return stored;
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
}

export function useLanguage() {
  const [language, setLanguage] = useState<Locale>(getInitialLanguage);

  useEffect(() => {
    void i18n.changeLanguage(language);
    writeStorage(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return { language, setLanguage };
}
