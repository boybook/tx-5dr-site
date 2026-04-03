import type { TFunction } from 'i18next';
import {
  formatTime,
  getArchLabel,
  getHeroAssetLabel,
  getPackageLabel,
} from '../lib/downloads';
import type { Locale } from '../lib/preferences';
import type { DetectedSystem, NormalizedAsset, NormalizedManifest } from '../lib/types';
import { ChevronDownIcon, GitHubIcon } from './icons';

type HeroSectionProps = {
  error: string | null;
  heroAlternateAssets: NormalizedAsset[];
  heroPrimaryAsset: NormalizedAsset | null;
  language: Locale;
  loading: boolean;
  manifest: NormalizedManifest | null;
  platformLabel: string;
  repoUrl: string;
  system: DetectedSystem;
  t: TFunction;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{value}</p>
    </div>
  );
}

export function HeroSection({
  error,
  heroAlternateAssets,
  heroPrimaryAsset,
  language,
  loading,
  manifest,
  platformLabel,
  repoUrl,
  system,
  t,
}: HeroSectionProps) {
  const primaryPlatformLabel = system.platform === 'unknown' ? t('labels.desktop') : platformLabel;

  return (
    <section className="relative mx-auto mt-14 max-w-4xl text-center sm:mt-20">
      <h1 className="mt-8 font-['Space_Grotesk'] text-5xl font-bold tracking-tight text-slate-950 sm:text-7xl dark:text-white">
        {t('hero.title')}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
        {t('hero.subtitle')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {heroPrimaryAsset ? (
          <div className="relative inline-flex items-stretch rounded-full bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:bg-white">
            <a
              href={heroPrimaryAsset.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-l-full px-6 py-3 pr-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:text-slate-950"
            >
              {getHeroAssetLabel(heroPrimaryAsset, primaryPlatformLabel, t)}
            </a>
            <details className="group relative">
              <summary className="flex h-full cursor-pointer list-none items-center justify-center rounded-r-full border-l border-white/15 px-4 text-white/85 transition hover:text-white dark:border-slate-200 dark:text-slate-700 dark:hover:text-slate-950 [&::-webkit-details-marker]:hidden">
                <span className="sr-only">{t('hero.otherArchitectures')}</span>
                <ChevronDownIcon className="size-4 transition group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-64 rounded-3xl border border-slate-200/70 bg-white/95 p-2 text-left shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
                {heroAlternateAssets.map((asset) => (
                  <a
                    key={asset.name}
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-white"
                  >
                    <span className="font-medium">{getArchLabel(asset.arch, t)}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {getPackageLabel(asset.packageType, t)}
                    </span>
                  </a>
                ))}
                <a
                  href="#downloads"
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-white"
                >
                  <span className="font-medium">{t('hero.allPlatforms')}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">#downloads</span>
                </a>
              </div>
            </details>
          </div>
        ) : (
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <GitHubIcon className="size-5" />
            {t('hero.fallback')}
          </a>
        )}

        {heroPrimaryAsset ? (
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <GitHubIcon className="size-5" />
            {t('hero.fallback')}
          </a>
        ) : null}
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
        <StatCard label={t('hero.version')} value={manifest?.version || '—'} />
        <StatCard label={t('hero.commit')} value={manifest?.commit || '—'} />
        <StatCard label={t('hero.builtAt')} value={formatTime(manifest?.publishedAt || null, language)} />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{t('hero.loading')}</p>
      ) : null}
      {error ? (
        <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-left text-sm text-amber-900 dark:text-amber-100">
          <p>{t('hero.error')}</p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
          >
            <GitHubIcon className="size-4" />
            {t('hero.fallback')}
          </a>
        </div>
      ) : null}
    </section>
  );
}
