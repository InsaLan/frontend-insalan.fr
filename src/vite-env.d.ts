/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL: string;
}

declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}
