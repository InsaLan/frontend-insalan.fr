import { createI18n } from 'vue-i18n';

import en from './lang/en.json';
import fr from './lang/fr.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'fr',
  messages: {
    fr,
    en,
  },
});

export default i18n;
