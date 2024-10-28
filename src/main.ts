import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleDown,
  faAngleUp,
  faArrowLeft,
  faArrowsRotate,
  faBolt,
  faCaretRight,
  faCheck,
  faChevronDown,
  faChevronUp,
  faCircle,
  faCircleCheck,
  faCirclePlus,
  faClock,
  faCrown,
  faDownload,
  faEye,
  faEyeSlash,
  faFile,
  faHammer,
  faMagnifyingGlass,
  faPencil,
  faPenToSquare,
  faPizzaSlice,
  faTrashCan,
  faWarning,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios, { type AxiosError } from 'axios';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { type Component, createApp } from 'vue';
import Multiselect from 'vue-multiselect';
import { router } from '@/router';
import { type ErrorMessage, useErrorStore } from '@/stores/error.store';

import App from './App.vue';

import './style.css';

/* add icons to the library */
library.add(
  faAngleDown,
  faAngleUp,
  faArrowLeft,
  faArrowsRotate,
  faBolt,
  faCaretRight,
  faCheck,
  faChevronDown,
  faChevronUp,
  faCircle,
  faCircleCheck,
  faCirclePlus,
  faClock,
  faCrown,
  faDownload,
  faEye,
  faEyeSlash,
  faFile,
  faHammer,
  faMagnifyingGlass,
  faPencil,
  faPenToSquare,
  faPizzaSlice,
  faTrashCan,
  faWarning,
  faXmark,
);

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

createApp(App as Component)
  .component('multiselect', Multiselect)
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
