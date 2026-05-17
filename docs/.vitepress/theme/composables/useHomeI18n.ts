import { computed } from 'vue';
import { useData } from 'vitepress';
import { translateMessage, type SupportedLocale } from '../../../../src/i18n';

export function useHomeI18n() {
  const { lang } = useData();
  const locale = computed<SupportedLocale>(() => {
    if (lang.value.startsWith('ja')) {
      return 'ja';
    }

    if (lang.value.startsWith('en')) {
      return 'en';
    }

    return 'zh-CN';
  });

  const t = (key: string, vars?: Record<string, string>) => translateMessage(locale.value, key, vars);

  return { locale, t };
}
