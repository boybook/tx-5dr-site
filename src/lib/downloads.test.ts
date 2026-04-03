import { describe, expect, it } from 'vitest';
import { buildHeroDownloadOptions, parseDisplayDateForTesting } from './downloads';
import type { NormalizedAsset } from './types';

describe('buildHeroDownloadOptions', () => {
  const assets: NormalizedAsset[] = [
    { name: 'TX-5DR-nightly-macos-x64.zip', url: '#', platform: 'macos', arch: 'x64', packageType: 'zip' },
    { name: 'TX-5DR-nightly-macos-arm64.zip', url: '#', platform: 'macos', arch: 'arm64', packageType: 'zip' },
    { name: 'TX-5DR-nightly-macos-arm64.dmg', url: '#', platform: 'macos', arch: 'arm64', packageType: 'dmg' },
  ];

  it('prefers the detected architecture and package priority', () => {
    const result = buildHeroDownloadOptions(assets, 'macos', 'arm64');
    expect(result.primary?.name).toBe('TX-5DR-nightly-macos-arm64.dmg');
    expect(result.alternates.map((asset) => asset.name)).toEqual([
      'TX-5DR-nightly-macos-arm64.zip',
      'TX-5DR-nightly-macos-x64.zip',
    ]);
  });

  it('falls back to the platform default architecture when detection is unknown', () => {
    const result = buildHeroDownloadOptions(assets, 'macos', 'unknown');
    expect(result.primary?.name).toBe('TX-5DR-nightly-macos-arm64.dmg');
  });
});

describe('parseDisplayDateForTesting', () => {
  it('parses UTC timestamp strings into valid dates', () => {
    const date = parseDisplayDateForTesting('2026-04-03 10:01:09 UTC');
    expect(date?.toISOString()).toBe('2026-04-03T10:01:09.000Z');
  });
});
