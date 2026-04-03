import { useEffect, useState } from 'react';
import { detectSystem } from '../lib/system';
import type { DetectedSystem } from '../lib/types';

const UNKNOWN_SYSTEM: DetectedSystem = {
  platform: 'unknown',
  arch: 'unknown',
  label: 'Unknown system',
};

export function useDetectedSystem() {
  const [system, setSystem] = useState<DetectedSystem>(UNKNOWN_SYSTEM);

  useEffect(() => {
    void detectSystem().then(setSystem);
  }, []);

  return system;
}
