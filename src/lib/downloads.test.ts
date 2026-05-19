import { describe, expect, it } from 'vitest';
import { buildHeroDownloadOptions, getHeroAssetLabel, parseDisplayDateForTesting } from './downloads';
import type { NormalizedAsset } from './types';

describe('buildHeroDownloadOptions', () => {
  const macosAssets: NormalizedAsset[] = [
    { name: 'TX-5DR-nightly-macos-x64.zip', url: '#', platform: 'macos', arch: 'x64', packageType: 'zip' },
    { name: 'TX-5DR-nightly-macos-arm64.zip', url: '#', platform: 'macos', arch: 'arm64', packageType: 'zip' },
    { name: 'TX-5DR-nightly-macos-arm64.dmg', url: '#', platform: 'macos', arch: 'arm64', packageType: 'dmg' },
  ];

  it('prefers the detected architecture and package priority', () => {
    const result = buildHeroDownloadOptions(macosAssets, 'macos', 'arm64');
    expect(result.primary?.name).toBe('TX-5DR-nightly-macos-arm64.dmg');
    expect(result.alternates.map((asset) => asset.name)).toEqual([
      'TX-5DR-nightly-macos-arm64.zip',
      'TX-5DR-nightly-macos-x64.zip',
    ]);
  });

  it('falls back to the platform default architecture when detection is unknown', () => {
    const result = buildHeroDownloadOptions(macosAssets, 'macos', 'unknown');
    expect(result.primary?.name).toBe('TX-5DR-nightly-macos-arm64.dmg');
  });

  it('prefers the Windows NSIS installer over manual archives', () => {
    const result = buildHeroDownloadOptions([
      { name: 'TX-5DR-nightly-windows-x64.zip', url: '#', platform: 'windows', arch: 'x64', packageType: 'zip' },
      { name: 'TX-5DR-nightly-windows-x64.7z', url: '#', platform: 'windows', arch: 'x64', packageType: '7z' },
      { name: 'TX-5DR-nightly-windows-x64-nsis.exe', url: '#', platform: 'windows', arch: 'x64', packageType: 'exe' },
    ], 'windows', 'x64');

    expect(result.primary?.name).toBe('TX-5DR-nightly-windows-x64-nsis.exe');
    expect(result.alternates.map((asset) => asset.name)).toEqual([
      'TX-5DR-nightly-windows-x64.7z',
      'TX-5DR-nightly-windows-x64.zip',
    ]);
  });

  it('keeps Linux AppImage behind distribution packages', () => {
    const result = buildHeroDownloadOptions([
      { name: 'TX-5DR-nightly-linux-x64.AppImage', url: '#', platform: 'linux', arch: 'x64', packageType: 'appimage' },
      { name: 'TX-5DR-nightly-linux-x64.zip', url: '#', platform: 'linux', arch: 'x64', packageType: 'zip' },
      { name: 'TX-5DR-nightly-linux-x64.rpm', url: '#', platform: 'linux', arch: 'x64', packageType: 'rpm' },
      { name: 'TX-5DR-nightly-linux-x64.deb', url: '#', platform: 'linux', arch: 'x64', packageType: 'deb' },
    ], 'linux', 'x64');

    expect(result.primary?.name).toBe('TX-5DR-nightly-linux-x64.deb');
    expect(result.alternates.map((asset) => asset.name)).toEqual([
      'TX-5DR-nightly-linux-x64.rpm',
      'TX-5DR-nightly-linux-x64.zip',
      'TX-5DR-nightly-linux-x64.AppImage',
    ]);
  });

  it('uses Android APK as the Android hero download', () => {
    const result = buildHeroDownloadOptions([
      {
        name: 'TX-5DR-Android-Bridge-0.1.0-nightly.202605190740.84b7ba2-arm64.apk',
        url: '#',
        platform: 'android',
        arch: 'arm64',
        packageType: 'apk',
      },
    ], 'android', 'unknown');

    expect(result.primary?.packageType).toBe('apk');
    expect(result.primary?.platform).toBe('android');
    expect(result.alternates).toEqual([]);
  });
});

describe('getHeroAssetLabel', () => {
  it('uses dedicated Android client wording for APKs', () => {
    const label = getHeroAssetLabel({
      name: 'TX-5DR-Android-Bridge.apk',
      url: '#',
      platform: 'android',
      arch: 'arm64',
      packageType: 'apk',
    }, 'Android', (key, vars) => {
      if (key === 'hero.androidCta') return 'Download Android client';
      if (key === 'hero.primaryCta') return `Download ${vars?.platform}`;
      return key;
    });

    expect(label).toBe('Download Android client');
  });
});

describe('parseDisplayDateForTesting', () => {
  it('parses UTC timestamp strings into valid dates', () => {
    const date = parseDisplayDateForTesting('2026-04-03 10:01:09 UTC');
    expect(date?.toISOString()).toBe('2026-04-03T10:01:09.000Z');
  });
});
