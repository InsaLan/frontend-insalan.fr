import { defineStore } from "pinia";
import { ref } from 'vue';
import axios from "axios";

export const useUserStore = defineStore('user', () => {
	let user = ref({})
	let isConnected = ref(false)
	let error = ref({})
	let has_error = ref(false)
	async function get_csrf() {
		await axios.get('http://api.localhost/v1/user/get-csrf/')
	}

	async function signin(email: String, username: String, password: String, password_validation: String) {
		get_csrf()
		const res =	await axios.post('/user/register/',{
				username: username,
				email: email,
				password: password,
				password_validation: password_validation
			} , {
		headers: {
		  'Content-Type': 'application/json'}
		}).catch((err) => {
			console.log(err)
		})
	}

	async function login(username: String, password: String) {
		get_csrf()
		await axios.post("/user/login/",{
			username: username,
			password: password
		}).catch((err) => {
			has_error.value = true
			error.value = err.response.data
		})

		const user_data = await axios.get('/user/me/', {withCredentials: true})
		user.value = user_data.data
		isConnected.value = true

	}
	async function logout() {
		await axios.post("/user/logout/")
		isConnected.value = false
		user.value = {}

	}
	return { user, 
			signin, 
			login,
			logout,
			isConnected,
			error
	}
})
