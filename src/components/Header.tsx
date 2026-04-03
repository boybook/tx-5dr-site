import type { TFunction } from 'i18next';
import type { Locale, ThemeMode } from '../lib/preferences';
import { MoonIcon, SunIcon } from './icons';

type HeaderProps = {
  language: Locale;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  repoUrl: string;
  t: TFunction;
  theme: ThemeMode;
};

export function Header({ language, onToggleLanguage, onToggleTheme, repoUrl, t, theme }: HeaderProps) {
  const languageLabel = language === 'zh-CN' ? '中文' : 'EN';
  const themeLabel = theme === 'dark' ? t('nav.themeDark') : t('nav.themeLight');

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <a href={repoUrl} target="_blank" rel="noreferrer" className="font-['Space_Grotesk'] text-lg font-bold tracking-[0.22em] text-rose-700 dark:text-rose-300">
        TX-5DR
      </a>
      <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={onToggleLanguage}
          className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          {languageLabel}
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-slate-300/70 bg-white/70 text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          aria-label={themeLabel}
          title={themeLabel}
        >
          {theme === 'dark' ? <MoonIcon className="size-[18px]" /> : <SunIcon className="size-[18px]" />}
        </button>
      </div>
    </header>
  );
}
