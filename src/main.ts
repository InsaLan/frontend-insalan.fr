import { createApp } from 'vue'
import vueClickOutsideElement from 'vue-click-outside-element'
import * as dotenv from 'dotenv'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router/index.ts'
import axios from 'axios'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faCirclePlus)
axios.defaults.baseURL = 'http://api.localhost/v1/'

const pinia = createPinia()
createApp(App).
	component('fa-awesome-icon', FontAwesomeIcon).
	use(pinia).
	use(vueClickOutsideElement).
	use(router).mount('#app')
