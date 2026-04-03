/// <reference types="vite/client" />

interface NavigatorUADataHighEntropyValues {
  architecture?: string;
  bitness?: string;
  platformVersion?: string;
}

interface NavigatorUAData {
  platform?: string;
  mobile?: boolean;
  getHighEntropyValues?: (hints: string[]) => Promise<NavigatorUADataHighEntropyValues>;
}

interface Navigator {
  userAgentData?: NavigatorUAData;
}
