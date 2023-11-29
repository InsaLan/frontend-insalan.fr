import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowsRotate, faCircleCheck, faCirclePlus, faFile, faPencil, faWarning, faCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios, { type AxiosError } from 'axios';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import { router } from '@/router';
import { type ErrorMessage, useErrorStore } from '@/stores/error.store';

import App from './App.vue';

import './style.css';

/* add icons to the library */
library.add(faCirclePlus, faPencil, faWarning, faFile, faArrowsRotate, faCircleCheck, faCircle);

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const pinia = createPinia();

pinia.use(createPersistedState({
  auto: true,
}));

createApp(App)
  .component('fa-awesome-icon', FontAwesomeIcon)
  .use(pinia)
  .use(router)
  .mount('#app');

const { add_error } = useErrorStore();

axios.interceptors.response.use(
  (res) => res,
  (error: AxiosError<string | { [key: string]: string | ErrorMessage }, unknown>) => {
    if (typeof error.response?.data === 'string') {
      add_error({ status: error.response.status, message: error.response.data });
    } else if (typeof error.response?.data === 'object') {
      Object.values(error.response.data).forEach((val) => {
        if (typeof val === 'object') {
          Object.values(val)
            .filter((item): item is string => typeof item === 'string')
            .forEach((item) => add_error({ status: error.response?.status, message: item }));
        } else {
          add_error({ status: error.response?.status, message: val });
        }
      });
    } else {
      add_error({
        status: error.response?.status,
        message: 'Une erreur inattendue est survenue, veuillez réessayer plus tard. Si le problème persiste, contactez un administrateur',
      });
    }
    return Promise.reject(error);
  },
);
