/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL: string;
}

declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module 'markdown-it-class' {
  import type MarkdownIt from 'markdown-it';

  export default function markdownitTagClass(md: MarkdownIt, mapping?: object = {}): void;
}
