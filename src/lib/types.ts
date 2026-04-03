export type ReleaseChannel = 'release' | 'nightly';
export type ReleaseSource = 'oss' | 'github';
export type SourcePolicy = 'auto' | ReleaseSource;
export type ProductType = 'app' | 'server';
export type SystemPlatform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';
export type SystemArch = 'x64' | 'arm64' | 'unknown';

export interface NormalizedAsset {
  name: string;
  url: string;
  sha256?: string;
  size?: number;
  platform: SystemPlatform | 'unknown';
  arch: string;
  packageType: string;
}

export interface NormalizedManifest {
  product: ProductType;
  channel: ReleaseChannel;
  tag: string;
  version: string | null;
  commit: string | null;
  publishedAt: string | null;
  releaseNotes: string | null;
  source: ReleaseSource;
  baseUrl?: string;
  assets: NormalizedAsset[];
}

export interface ReleaseCatalog {
  app: Record<ReleaseChannel, NormalizedManifest | null>;
  server: Record<ReleaseChannel, NormalizedManifest | null>;
  countryCode: string | null;
  preferredSource: ReleaseSource;
}

export interface DetectedSystem {
  platform: SystemPlatform;
  arch: SystemArch;
  label: string;
}
