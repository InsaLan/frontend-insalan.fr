import { createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home.vue'
import  Tournament from '../views/Tournament.vue'
import Informations from '../views/Informations.vue'
import Public from '../views/Public.vue'
import Eat from '../views/Eat.vue'
import Me from '../views/Me.vue'

const routes = [
	{
		path: '/',
		component: Home,

	},{
		path: '/tournament',
		component: Tournament,
	},
	{
		path: '/informations',
		component: Informations,
	},{
		path: '/public',
		component:  Public,
	},{
		path: '/eat',
		component: Eat,
	},{
		path: '/me',
		component: Me,
	}
] as const;

export const router = createRouter({
	history: createWebHistory(),
	routes,
});

