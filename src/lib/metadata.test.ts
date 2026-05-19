import { describe, expect, it } from 'vitest';
import {
  getRecommendedAsset,
  hasCatalogDataForTesting,
  normalizeManifestForTesting,
  resolveAssetUrlForTesting,
} from './metadata';
import type { NormalizedAsset, NormalizedManifest, ReleaseCatalog } from './types';

describe('resolveAssetUrlForTesting', () => {
  const asset: NormalizedAsset = {
    name: 'TX-5DR-nightly-macos-arm64.dmg',
    url: 'https://cdn.example.com/TX-5DR-nightly-macos-arm64.dmg',
    urlCn: 'https://cdn.example.com/TX-5DR-nightly-macos-arm64.dmg',
    urlGlobal: 'https://github.com/example/TX-5DR-nightly-macos-arm64.dmg',
    urlOss: 'https://cdn.example.com/TX-5DR-nightly-macos-arm64.dmg',
    urlGithub: 'https://github.com/example/TX-5DR-nightly-macos-arm64.dmg',
    platform: 'macos',
    arch: 'arm64',
    packageType: 'dmg',
  };

  it('prefers OSS links for mainland China', () => {
    expect(resolveAssetUrlForTesting(asset, 'oss')).toEqual({
      url: 'https://cdn.example.com/TX-5DR-nightly-macos-arm64.dmg',
      source: 'oss',
    });
  });

  it('prefers GitHub links outside mainland China', () => {
    expect(resolveAssetUrlForTesting(asset, 'github')).toEqual({
      url: 'https://github.com/example/TX-5DR-nightly-macos-arm64.dmg',
      source: 'github',
    });
  });
});

describe('getRecommendedAsset', () => {
  const manifest: NormalizedManifest = {
    product: 'app',
    channel: 'nightly',
    tag: 'nightly-app',
    version: '1.0.0-nightly.202604031001+98be3ed',
    commit: '98be3ed',
    commitTitle: 'feat: ship unified release metadata',
    publishedAt: '2026-04-03 10:01:09 UTC',
    releaseNotes: null,
    recentCommits: [],
    source: 'oss',
    assets: [
      { name: 'TX-5DR-nightly-windows-x64.zip', url: '#', platform: 'windows', arch: 'x64', packageType: 'zip' },
      { name: 'TX-5DR-nightly-windows-x64-nsis.exe', url: '#', platform: 'windows', arch: 'x64', packageType: 'exe' },
      { name: 'TX-5DR-nightly-windows-x64.7z', url: '#', platform: 'windows', arch: 'x64', packageType: '7z' },
    ],
  };

  it('prefers installer for windows', () => {
    const recommended = getRecommendedAsset(manifest, { platform: 'windows', arch: 'x64', label: 'Windows x64' });
    expect(recommended?.name).toBe('TX-5DR-nightly-windows-x64-nsis.exe');
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

describe('normalizeManifestForTesting', () => {
  it('parses Android bridge APK manifests', () => {
    const manifest = normalizeManifestForTesting({
      product: 'android-bridge',
      channel: 'nightly',
      tag: 'nightly-android-bridge',
      version: '0.1.0-nightly.202605190740+84b7ba2',
      commit: '84b7ba2',
      commit_title: 'Publish Android bridge nightly APK',
      published_at: '2026-05-19T07:40:00Z',
      assets: [
        {
          name: 'TX-5DR-Android-Bridge-0.1.0-nightly.202605190740.84b7ba2-arm64.apk',
          url: 'https://dl.tx5dr.com/tx-5dr/android-bridge/nightly/TX-5DR-Android-Bridge.apk',
          platform: 'android',
          arch: 'arm64',
          package_type: 'apk',
          sha256: 'abc123',
          size: 318082961,
        },
      ],
    }, 'oss');

    expect(manifest?.product).toBe('android-bridge');
    expect(manifest?.assets[0]).toMatchObject({
      platform: 'android',
      arch: 'arm64',
      packageType: 'apk',
      size: 318082961,
    });
  });
});

describe('hasCatalogDataForTesting', () => {
  it('returns false for an empty catalog', () => {
    const catalog: ReleaseCatalog = {
      app: { nightly: null, release: null },
      androidBridge: { nightly: null, release: null },
      server: { nightly: null, release: null },
      countryCode: null,
      preferredSource: 'github',
    };

    expect(hasCatalogDataForTesting(catalog)).toBe(false);
  });

  it('returns true when any manifest is present', () => {
    const catalog: ReleaseCatalog = {
      app: {
        nightly: {
          product: 'app',
          channel: 'nightly',
          tag: 'nightly-app',
          version: '1.0.0-nightly.202604031001+98be3ed',
          commit: '98be3ed',
          commitTitle: 'feat: ship unified release metadata',
          publishedAt: '2026-04-03 10:01:09 UTC',
          releaseNotes: null,
          recentCommits: [],
          source: 'oss',
          assets: [],
        },
        release: null,
      },
      androidBridge: { nightly: null, release: null },
      server: { nightly: null, release: null },
      countryCode: 'CN',
      preferredSource: 'oss',
    };

    expect(hasCatalogDataForTesting(catalog)).toBe(true);
  });
});
