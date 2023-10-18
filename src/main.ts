import { createApp } from 'vue'
import vueClickOutsideElement from 'vue-click-outside-element'
import * as dotenv from 'dotenv'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import { router } from './router/index.ts'
import axios from 'axios'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCirclePlus, faPencil, faWarning, faFile } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faCirclePlus, faPencil, faWarning, faFile)
axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

const pinia = createPinia()
pinia.use(createPersistedState({
	auto: true
}))
createApp(App).
	component('fa-awesome-icon', FontAwesomeIcon).
	use(pinia).
	use(vueClickOutsideElement).
  use(router).mount('#app')
import { useErrorStore } from './stores/error.store'
const { add_error } = useErrorStore()

axios.interceptors.response.use(
	res => res,
  	error => {
    	console.log(error.response.data)
	console.log(error.response.status)
	  add_error({status: error.response.status , message: "Une erreur inattendue est survenue, veuillez réessayer plus tard. Si le problème persiste, contactez un administrateur"})
	return Promise.reject(error)});


