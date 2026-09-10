/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_POWERUP_NAME: string;
  readonly VITE_POWERUP_APP_KEY: string;
  readonly VITE_POWERUP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
