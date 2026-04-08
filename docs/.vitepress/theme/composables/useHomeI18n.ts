import { computed } from 'vue';
import { useData } from 'vitepress';
import { translateMessage, type SupportedLocale } from '../../../../src/i18n';

export function useHomeI18n() {
  const { lang } = useData();
  const locale = computed<SupportedLocale>(() => (lang.value.startsWith('en') ? 'en' : 'zh-CN'));

  const t = (key: string, vars?: Record<string, string>) => translateMessage(locale.value, key, vars);

  return { locale, t };
}
