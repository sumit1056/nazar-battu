/// <reference types="vite/client" />

import type { ElectronAPI } from '../../preload/index';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.wav' {
  const content: string;
  export default content;
}
