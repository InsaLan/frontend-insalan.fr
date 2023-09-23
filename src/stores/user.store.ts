import { defineStore } from "pinia";
import { ref, computed } from 'vue';
import axios from "axios";
import { useRouter } from "vue-router";

import { useToastStore } from './toast.store';


export const useUserStore = defineStore('user', () => {
	let user = ref({})
	let isConnected = ref(false)
	const router = useRouter()
	const ToastStore = useToastStore()
	const { setContent }  = ToastStore;
	async function get_csrf() {
		await axios.get('/user/get-csrf/')
	}

	async function signin(email: String, username: String, password: String, password_validation: String) {
		get_csrf()
		const data = {
			username,
			email,
			password,
			password_validation
		}
		console.log(data)
		const res = await axios.post('/user/register/', data, { headers: { 'Content-Type': 'application/json'}}) 
		
		setContent(`Un email de confirmation vous a été envoyé a ${email} pour confirmer votre compte` , "success")
	}

	async function login(username: String, password: String) {
		get_csrf()

		try {
			const res = await axios.post("/user/login/",
			{
				username,
				password
			}, {
				withCredentials: true
			})
			
			const user_data = await axios.get('/user/me/', {withCredentials: true})
			user.value = user_data.data
			isConnected.value = true
			setContent(`Bienvenue ${username}`, "success")
			router.push("/me")
		} catch(err) {}
	}
	async function reset_password(email: String) {
		get_csrf()
		try {
		const res = await axios.post('/user/password/reset/ask', {email})
		} catch(err) {}
	}
	async function logout() {
		await axios.post("/user/logout/").then(
			()=> {		
			isConnected.value = false
			user.value = {}
			})


	}
	const role = computed(()=> {
		if (user.value.is_superuser) {return "dev" }
		else if(user.value.is_staff) { return "staff" }
		else { return "joueur"}
	})
	return { user, 
			signin, 
			login,
			logout,
			role,
			isConnected
	}
})
