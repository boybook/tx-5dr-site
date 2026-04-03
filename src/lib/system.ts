import type { DetectedSystem, SystemArch, SystemPlatform } from './types';

function normalizeArch(value: string | null | undefined): SystemArch {
  const input = (value || '').toLowerCase();
  if (/(arm64|aarch64)/.test(input)) return 'arm64';
  if (/(x86_64|x64|amd64|wow64|win64|x86 64|x86_32 64)/.test(input)) return 'x64';
  return 'unknown';
}

function detectPlatformFromSignals(value: string): SystemPlatform {
  const input = value.toLowerCase();
  if (/(iphone|ipad|ipod|ios)/.test(input)) return 'ios';
  if (input.includes('android')) return 'android';
  if (input.includes('windows')) return 'windows';
  if (input.includes('macos')) return 'macos';
  if (input.includes('mac os') || input.includes('macintosh')) return 'macos';
  if (input.includes('linux') || input.includes('x11')) return 'linux';
  return 'unknown';
}

export async function detectSystem(): Promise<DetectedSystem> {
  if (typeof navigator === 'undefined') {
    return { platform: 'unknown', arch: 'unknown', label: 'Unknown system' };
  }

  const rawPlatform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
  const platform = detectPlatformFromSignals(`${rawPlatform} ${navigator.userAgent}`);

  let arch = normalizeArch(navigator.userAgent);
  try {
    const values = await navigator.userAgentData?.getHighEntropyValues?.(['architecture', 'bitness']);
    if (values?.architecture) {
      const candidate = normalizeArch(`${values.architecture} ${values.bitness || ''}`);
      if (candidate !== 'unknown') {
        arch = candidate;
      }
    }
  } catch {
    // ignore
  }

  const labelPlatform = platform === 'windows'
    ? 'Windows'
    : platform === 'macos'
      ? 'macOS'
      : platform === 'linux'
        ? 'Linux'
        : platform === 'android'
          ? 'Android'
          : platform === 'ios'
            ? 'iOS'
        : 'Unknown';
  const labelArch = arch === 'unknown' ? '' : ` ${arch}`;

  return {
    platform,
    arch,
    label: `${labelPlatform}${labelArch}`.trim(),
  };
}
