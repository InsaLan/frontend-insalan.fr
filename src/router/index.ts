import { createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home.vue'
import Tournament from '../views/Tournament.vue'
import Informations from '../views/Informations.vue'
import Public from '../views/Public.vue'
import Eat from '../views/Eat.vue'
import Me from '../views/Me.vue'
import TournamentDetail from '../views/TournamentDetail.vue'
import Register from '../views/Register.vue'
import EmailVerif from '../views/EmailVerif.vue'
import Logout from '../views/Logout.vue'
import TournamentRegister  from '../views/TournamentRegister.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ScanQrCode from '../views/ScanQrCode.vue'
import { useUserStore } from '../stores/user.store'
const routes = [
	{
		path: '/',
		component: Home,

	},{

		path: '/verification/:idname/:idtoken',
		component: EmailVerif,
		props: true,

	},{
		path: '/tournament',
		component: Tournament,
	},
	{
		path: '/info',
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
		beforeEnter: () => {
			const { isConnected } = useUserStore()
			if (!isConnected){
				return {path:'/register'}

			}
		},
	}, 
	{
		path: '/tournament/:id/register',
		component: TournamentRegister,
		props: true,
		beforeEnter: () => {
			const { isConnected } = useUserStore()
			if (!isConnected){
				return {path:'/register'}

			}
		},
	},
	{
		path: '/register',
		component: Register
	},
	{
		path: '/tournament/:id',
		component: TournamentDetail, 
		props: true

	},
	{
		path: '/reset-password',
		component: ResetPassword
	},
	{
		path: '/logout',
		component: Logout
	},
	{
		path: '/ticket/scan',
		component: ScanQrCode
	}
] as const;

export const router = createRouter({
	history: createWebHistory(),
	routes,
});

