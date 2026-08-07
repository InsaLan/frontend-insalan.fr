import { createI18n } from 'vue-i18n';

import en from './lang/en-GB.json';
import fr from './lang/fr-FR.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en-GB',
  fallbackLocale: 'fr-FR',
  messages: {
    'fr-FR': fr,
    'en-GB': en,
  },
});

export default i18n;
