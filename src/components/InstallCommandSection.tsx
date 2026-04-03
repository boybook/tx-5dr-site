import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { CheckIcon, CopyIcon } from './icons';

type InstallCommandSectionProps = {
  command: string;
  t: TFunction;
};

export function InstallCommandSection({ command, t }: InstallCommandSectionProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mt-20 rounded-[2rem] border border-white/15 bg-slate-950 px-6 py-8 text-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.32)] dark:border-white/10 dark:bg-slate-950/80 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-rose-300">{t('server.title')}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{t('server.description')}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <code className="min-w-0 flex-1 overflow-x-auto text-sm text-rose-200">{command}</code>
        <button
          type="button"
          onClick={() => { void handleCopy(); }}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-slate-100 transition hover:border-rose-400 hover:bg-white/12 hover:text-white"
          aria-label={copied ? t('server.copied') : t('server.copy')}
          title={copied ? t('server.copied') : t('server.copy')}
        >
          {copied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
        </button>
      </div>
    </section>
  );
}
