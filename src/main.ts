import { createApp } from 'vue'
import vueClickOutsideElement from 'vue-click-outside-element'
import * as dotenv from 'dotenv'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router/index.ts'
const pinia = createPinia()
createApp(App).
	use(pinia).
	use(vueClickOutsideElement).
	use(router).mount('#app')
