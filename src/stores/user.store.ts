import { defineStore } from "pinia";
import { ref } from 'vue';
import axios from "axios";
import { useRouter } from "vue-router";
export const useUserStore = defineStore('user', () => {
	let user = ref({})
	let isConnected = ref(false)
	let errors = ref({})
	let has_error = ref(false)
	const router = useRouter()
	async function get_csrf() {
		await axios.get('/user/get-csrf/')
	}

	async function signin(email: String, username: String, password: String, password_validation: String) {
		get_csrf()
		try { 
			const data = {
				username,
				email,
				password,
				password_validation
			}

			const res = await axios.post('/user/register/',data, { headers: { 'Content-Type': 'application/json'}}) 
			errors.value = {}
		} catch(err) {
			errors.value = err.response
		}
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
		router.push("/me")
		} catch(err) {
			has_error.value = true
			errors.value = err.response
			return
		}
	}
	async function logout() {
		await axios.post("/user/logout/").then(
			()=> {		
			isConnected.value = false
			user.value = {}
			})


	}
	return { user, 
			signin, 
			login,
			logout,
			isConnected,
			errors,
			has_error
	}
})
