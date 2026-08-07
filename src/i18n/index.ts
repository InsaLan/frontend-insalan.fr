import { createI18n } from 'vue-i18n';

import en from './lang/en';
import fr from './lang/fr';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    fr,
    en,
  },
});

export default i18n;
