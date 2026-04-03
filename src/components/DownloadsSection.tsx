import type { TFunction } from 'i18next';
import type { NormalizedAsset, NormalizedManifest } from '../lib/types';
import { DownloadCard } from './DownloadCard';

type DownloadSectionCard = {
  assets: NormalizedAsset[];
  key: string;
  manifest: NormalizedManifest | null;
  recommended: NormalizedAsset | null;
  title: string;
};

type DownloadsSectionProps = {
  cards: DownloadSectionCard[];
  t: TFunction;
};

export function DownloadsSection({ cards, t }: DownloadsSectionProps) {
  return (
    <section id="downloads" className="mt-20 scroll-mt-8 space-y-6">
      <div>
        <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{t('labels.allDownloads')}</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('nav.channelNightly')}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {cards.map((card) => (
          <DownloadCard
            key={card.key}
            title={card.title}
            manifest={card.manifest}
            assets={card.assets}
            recommended={card.recommended}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
