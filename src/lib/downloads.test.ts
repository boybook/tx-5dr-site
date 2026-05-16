import { describe, expect, it } from 'vitest';
import { buildHeroDownloadOptions, parseDisplayDateForTesting } from './downloads';
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
});

describe('parseDisplayDateForTesting', () => {
  it('parses UTC timestamp strings into valid dates', () => {
    const date = parseDisplayDateForTesting('2026-04-03 10:01:09 UTC');
    expect(date?.toISOString()).toBe('2026-04-03T10:01:09.000Z');
  });
});
