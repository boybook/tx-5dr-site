import type { TFunction } from 'i18next';
import {
  formatBytes,
  formatTime,
  getAssetCardTitle,
  getPackageExtensionLabel,
  getSourceLabel,
} from '../lib/downloads';
import i18n from '../i18n';
import type { NormalizedAsset, NormalizedManifest } from '../lib/types';

type DownloadCardProps = {
  assets: NormalizedAsset[];
  manifest: NormalizedManifest | null;
  recommended: NormalizedAsset | null;
  t: TFunction;
  title: string;
};

export function DownloadCard({ assets, manifest, recommended, t, title }: DownloadCardProps) {
  return (
    <section className="rounded-3xl border border-white/15 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {manifest?.version || '—'} · {manifest ? getSourceLabel(manifest.source, t) : '—'}
          </p>
        </div>
        {manifest?.publishedAt ? (
          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
            {formatTime(manifest.publishedAt, i18n.language === 'zh-CN' ? 'zh-CN' : 'en')}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/70 px-4 py-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            {t('hero.unavailable')}
          </div>
        ) : null}

        {assets.map((asset) => {
          const isRecommended = recommended?.name === asset.name;
          return (
            <a
              key={asset.name}
              href={asset.url}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-lg dark:border-white/10 dark:bg-slate-950/35"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{getAssetCardTitle(asset, title, t)}</span>
                {isRecommended ? (
                  <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                    {t('labels.recommended')}
                  </span>
                ) : null}
                <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {getPackageExtensionLabel(asset.name)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span>{t('labels.size')}: {formatBytes(asset.size)}</span>
                {asset.sha256 ? <span>{t('labels.sha256')}: {asset.sha256.slice(0, 12)}…</span> : null}
              </div>
              <p className="mt-3 break-all text-xs text-slate-500 transition group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                {asset.name}
              </p>
            </a>
          );
        })}
      </div>

      <details className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/35">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 dark:text-white">
          {t('labels.releaseNotes')}
        </summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
          {manifest?.releaseNotes || t('labels.noNotes')}
        </p>
      </details>
    </section>
  );
}
