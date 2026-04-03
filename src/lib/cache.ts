export function loadCachedJson<T>(key: string, maxAgeMs: number): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp?: number; value?: T };
    if (!parsed.timestamp || Date.now() - parsed.timestamp > maxAgeMs) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value ?? null;
  } catch {
    return null;
  }
}

export function saveCachedJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), value }));
  } catch {
    // ignore storage failures
  }
}
