import { describe, expect, it } from 'vitest';
import { buildNightlyVersion, getRecommendedAsset, parseGithubBodyForTesting } from './metadata';
import type { NormalizedManifest } from './types';

describe('buildNightlyVersion', () => {
  it('builds nightly version from base version, build time, and commit', () => {
    expect(buildNightlyVersion('1.2.3', '2026-04-03 10:01:09 UTC', '98be3ed')).toBe('1.2.3-nightly.202604031001+98be3ed');
  });
});

describe('parseGithubBodyForTesting', () => {
  it('extracts commit and built time from release body', () => {
    const parsed = parseGithubBodyForTesting(`**Built at** （构建时间）: 2026-04-03 09:55:45 UTC\n**Commit**: [65467de](https://github.com/boybook/tx-5dr/commit/65467de2c7a7af18d3a0dcd5995cf053ff08e73d)`);
    expect(parsed.commitShort).toBe('65467de');
    expect(parsed.commitFull).toBe('65467de2c7a7af18d3a0dcd5995cf053ff08e73d');
    expect(parsed.builtAt).toBe('2026-04-03 09:55:45 UTC');
  });
});

describe('getRecommendedAsset', () => {
  const manifest: NormalizedManifest = {
    product: 'app',
    channel: 'nightly',
    tag: 'nightly-app',
    version: '1.0.0-nightly.202604031001+98be3ed',
    commit: '98be3ed',
    publishedAt: '2026-04-03 10:01:09 UTC',
    releaseNotes: null,
    source: 'oss',
    assets: [
      { name: 'TX-5DR-nightly-windows-x64.zip', url: '#', platform: 'windows', arch: 'x64', packageType: 'zip' },
      { name: 'TX-5DR-nightly-windows-x64.msi', url: '#', platform: 'windows', arch: 'x64', packageType: 'msi' },
      { name: 'TX-5DR-nightly-windows-x64.7z', url: '#', platform: 'windows', arch: 'x64', packageType: '7z' },
    ],
  };

  it('prefers installer for windows', () => {
    const recommended = getRecommendedAsset(manifest, { platform: 'windows', arch: 'x64', label: 'Windows x64' });
    expect(recommended?.packageType).toBe('msi');
  });

  it('returns null when browser cannot confirm architecture and multiple arches exist', () => {
    const multiArchManifest: NormalizedManifest = {
      ...manifest,
      assets: [
        { name: 'TX-5DR-nightly-macos-x64.dmg', url: '#', platform: 'macos', arch: 'x64', packageType: 'dmg' },
        { name: 'TX-5DR-nightly-macos-arm64.dmg', url: '#', platform: 'macos', arch: 'arm64', packageType: 'dmg' },
      ],
    };

    const recommended = getRecommendedAsset(multiArchManifest, { platform: 'macos', arch: 'unknown', label: 'macOS' });
    expect(recommended).toBeNull();
  });
});
