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
import { useNotificationStore } from '@/stores/notification.store';

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

const { addNotification } = useNotificationStore();

axios.interceptors.response.use(
  (res) => res,
  (error: AxiosError<string | string[] | { [key: string]: string }, unknown>) => {
    if (error.response?.data) {
      addNotification(error.response.data, 'error');
    }
    return Promise.reject(error);
  },
);
