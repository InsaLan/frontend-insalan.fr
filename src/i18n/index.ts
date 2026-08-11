import { createI18n } from 'vue-i18n';

import en from './lang/en.json';
import fr from './lang/fr.json';

const datetimeFormats = {
  en: {
    short: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
    long: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
  fr: {
    short: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
    long: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
} as const;

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'fr',
  messages: {
    fr,
    en,
  },
  datetimeFormats,
});

export default i18n;
