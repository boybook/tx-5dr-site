import type { ReactNode } from 'react';

type ContentSectionItem = {
  body: string;
  meta?: ReactNode;
  title: string;
};

type ContentSectionProps = {
  gridClassName: string;
  items: ContentSectionItem[];
  title: string;
};

export function ContentSection({ gridClassName, items, title }: ContentSectionProps) {
  return (
    <section className="mt-20">
      <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950 dark:text-white">{title}</h2>
      <div className={`mt-6 grid gap-4 ${gridClassName}`}>
        {items.map((item) => (
          <article key={item.title} className="rounded-3xl border border-white/15 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-950 dark:text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
            {item.meta ? (
              <p className="mt-4 text-sm font-medium text-rose-700 dark:text-rose-300">{item.meta}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
