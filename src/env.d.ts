/// <reference types="vite/client" />

interface NavigatorUADataValues {
  architecture?: string;
  bitness?: string;
}

interface NavigatorUAData {
  platform?: string;
  getHighEntropyValues?(hints: string[]): Promise<NavigatorUADataValues>;
}

interface Navigator {
  userAgentData?: NavigatorUAData;
}
