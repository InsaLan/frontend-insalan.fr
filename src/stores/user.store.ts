import { defineStore } from "pinia";
import { ref, onMounted } from 'vue';
import { User } from "../models/user.models";
import axios from "axios";
export const useUserStore = defineStore('user',() => {
	const user: User = {
		id: 1,
		username: "",
		email: ""
	}

	async function signin(email: String, username: String, password: String) {
		await axios.post('http://api.localhost/v1/user/register/',{
				username: username,
				email: email,
				password: password
			} , {
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded'}
		})
	}
	async function login(username: String, password: String) {
		await axios.post("http://api.localhost/v1/api-auth/login",{
			username: username,
			password: password
		})

	}
	return { user, signin }
})
