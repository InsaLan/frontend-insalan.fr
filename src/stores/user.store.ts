import { defineStore } from "pinia";
import { ref, computed } from 'vue';
import axios from "axios";
import { useRouter } from "vue-router";

import { useToastStore } from './toast.store';
import { useErrorStore } from './error.store';

export const useUserStore = defineStore('user', () => {
	let user = ref({})
	let isConnected = ref(false)
	const router = useRouter()
	const ToastStore = useToastStore()
	const ErrorStore = useErrorStore()
	const inscriptions = ref({})
	const MailVerified = ref (false)
	const { setContent }  = ToastStore;
	const { add_error } = ErrorStore;
	async function get_csrf() {
		const response = await axios.get('/user/get-csrf/')
	}


	// API Call to verify an email adress (an email with an URL made with the name and the token is sent, we take from it these information and verify them)
	// If both value are correct, the back set the mail on verified, and return a response(), function continue and MailVerified is set on true
	// If one (or both) values are incorrect, an error is returned and catch by the classic error catcher, stopping the function : MailVerified stays on false
	async function verifMail(idname: String , idtoken: String){
		//I set 
		MailVerified.value=false
		await axios.get(`/user/confirm/${idname}/${idtoken}`)
		//Active only if the API Call doesn't return an error
		MailVerified.value=true
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
	async function fetch_user_inscription_full(user_id: String) {
		try {
			let ongoing = ref([])
			let past = ref([])

			let unpaid = ref({})

			const InscriptionId = await axios.get(`/tournament/player/fromUserId/${user_id}`)
			for(let i = 0; i < InscriptionId.data.length; i++){
				let inscription_details = await axios.get(`/tournament/player/${InscriptionId.data[i]}`)
				let teams_details = await axios.get(`/tournament/team/${inscription_details.data.team}`)
				inscription_details.data.team = teams_details.data
				let tournament_details = await axios.get(`/tournament/tournament/${teams_details.data.tournament}/full`)
				inscription_details.data.team.tournament = tournament_details.data
				console.log(inscription_details.data)
		
				if(inscription_details.data.payment_status == "NOTPAID") {
					unpaid.value[inscription_details.data.team.id] = inscription_details.data
				}
		
				if(teams_details.data.tournament.event.ongoing) {
					ongoing.value.push(inscription_details.data)
				} else {
					past.value.push(inscription_details.data)
				}
			}
			inscriptions.value = {
				ongoing,
				past,
				unpaid
			}
		} catch(err) {
			console.log(err)
		}
	}
	async function patch_user(data: Object) {
		await get_csrf()
		/*try {
			console.log(axios.defaults.headers.common['X-CSRFToken'])
			const res = await axios.patch('/user/me/', data, {withCredentials: true})
			user.value = res.data
			setContent("Vos informations ont été modifiées", "success")
		} catch(err) {
			console.log(err)
		}*/
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
			verifMail,
			role,
			isConnected,
			inscriptions,
			MailVerified
	}
})
