import { useEffect, useState } from 'react';
import { fetchReleaseCatalog } from '../lib/metadata';
import type { ReleaseCatalog } from '../lib/types';

export function useReleaseCatalog() {
  const [catalog, setCatalog] = useState<ReleaseCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchReleaseCatalog('auto')
      .then((nextCatalog) => {
        setCatalog(nextCatalog);
        setLoading(false);
      })
      .catch((cause) => {
        console.error('failed to load release catalog', cause);
        setError('load_failed');
        setLoading(false);
      });
  }, []);

  return { catalog, loading, error };
}
