import { createRouter, RouteConfig, createWebHashHistory} from 'vue-router'
import Home from '../views/Home.vue'
import  Tournament from '../views/Tournament.vue'
import Informations from '../views/Informations.vue'
import Public from '../views/Public.vue'
import Eat from '../views/Eat.vue'

const routes: Array<RouteConfig> = [
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
	}
];

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

