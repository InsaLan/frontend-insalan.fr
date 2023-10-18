import { defineStore } from "pinia";
import { ref, computed } from 'vue';
import axios from "axios";
import { useRouter } from "vue-router";

import { useToastStore } from './toast.store';
import { useErrorStore } from './error.store';

export const useUserStore = defineStore('user', () => {
	let user = ref({})
	let isConnected = ref(false)
	let csrf = ref("")
	const router = useRouter()
	const ToastStore = useToastStore()
	const ErrorStore = useErrorStore()
	const inscriptions = ref({})
	const { setContent }  = ToastStore;
	const { add_error } = ErrorStore;
	
	/*
	 * Get a new csrf token from the server
	 * @return Promise<void> 
	*/
	async function get_csrf():Promise<void> {
		await axios.get('/user/get-csrf/');
		const cookies:Array<{name: string, value: string}> = []
		document.cookie.split(';').forEach((cookie) => {
			cookies.push({
				name: cookie.split('=')[0],
				value: cookie.split('=')[1]
			});
		});
		const token = cookies.find(cookie => cookie.name === "csrftoken");
		csrf.value = token ? token.value : "";
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
		location = "/";

	}

	/*
	 * Fetch all the inscription of a user
	 * @param user_id: the id of the user
	 * @return Promise<void> 
	*/
	async function fetch_user_inscription_full(user_id: String): Promise<void> {
		try {
			// ref object to store the data
			let ongoing = ref([]);
			let past = ref([]);
			let unpaid = ref({});

			// Get all the inscription of the user
			const InscriptionId = await axios.get(`/tournament/player/fromUserId/${user_id}`);
			for(let i = 0; i < InscriptionId.data.length; i++){
				// Get the details of the inscription
				let inscription_details = await axios.get(`/tournament/player/${InscriptionId.data[i]}`);
				// Get the details of the team
				let teams_details = await axios.get(`/tournament/team/${inscription_details.data.team}`);
				inscription_details.data.team = teams_details.data;
				// Get the details of the tournament
				let tournament_details = await axios.get(`/tournament/tournament/${teams_details.data.tournament}/full`);
				inscription_details.data.team.tournament = tournament_details.data;
				console.log(inscription_details.data);
		
				// Add the inscription to the right array
				if(inscription_details.data.payment_status == "NOTPAID") {
					unpaid.value[inscription_details.data.team.id] = inscription_details.data;
				};
				// Check if the tournament is ongoing or not
				if(teams_details.data.tournament.event.ongoing) {
					ongoing.value.push(inscription_details.data);
				} else {
					past.value.push(inscription_details.data);
				};
			}
			// Set the value of the ref object
			inscriptions.value = {
				ongoing,
				past,
				unpaid
			};
		} catch(err) {
			add_error("Impossible de récupérer vos inscriptions, veuillez réessayer plus tard ou contacter un administrateur");
		}
	}
	async function patch_user(data: Object) {
		await get_csrf()
		try {
			const res = await axios.patch('/user/me/', data, {
				withCredentials: true,
				headers: {
					'X-CSRFToken': csrf.value,
					'Content-Type': 'application/json'
				}
			})
			if(res.status == 200) {
				if(data['current_password']) {
					setContent("Vos informations ont été modifiées, vous devez vous reconnecter", "success")
					logout()
				} else {
					for(let key in data) {
						user.value[key] = data[key]
					}
					setContent("Vos informations ont été modifiées", "success")
				}
			}
		} catch(err) {
			if(err.request.status == 403) {
				add_error({data: {status: err.request.status, messages: "Le mot de passe actuel est différent de celui que vous avez entré"}})
			} else if(err.request.status == 400) {
				const response = JSON.parse(err.request.response)
				if(response["user"]) {
					add_error({data: {status: err.request.status, messages: response["user"][0]}})
				} else {
					add_error({data: {status: err.request.status, messages: response["password"]}})
				}
			}
		}
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
			fetch_user_inscription_full,
			patch_user,
			role,
			isConnected,
			inscriptions
	}
})
