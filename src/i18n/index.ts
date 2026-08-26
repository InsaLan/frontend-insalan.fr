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
  locale: 'fr',
  messages: {
    fr,
    en,
  },
  datetimeFormats,
});

export default i18n;

export const setLocale = (locale: string) => {
  const candidates = [locale, locale.split('-')[0]];
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const availableLocale = i18n.global.availableLocales.find(((l) => l === candidate));
    if (availableLocale) {
      i18n.global.locale.value = availableLocale;
      localStorage.setItem('user-selected-locale', availableLocale);
      break;
    }
  }
};

export const initializeLocale = async () => {
  const userSelectedLocale = localStorage.getItem('user-selected-locale');
  if (userSelectedLocale) {
    setLocale(userSelectedLocale);
    return;
  }
  if (navigator.language) {
    setLocale(navigator.language);
  }
};
