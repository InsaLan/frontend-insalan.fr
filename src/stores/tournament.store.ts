import { defineStore } from "pinia";
import { ref } from 'vue';
import axios from "axios";

export const useTournamentStore = defineStore('tournament', () => {
	let tournaments = ref({})
	let tournament = ref({})
	async function fetchTournaments() {
		axios.get('/tournament/tournament').then((res)=>{
			tournaments.value = res.data
			console.log(res.data)
		})

	}
	async function fetchThisYear() {
		const year = 2009 //new Date().getFullYear()
		const res = await axios.get(`/tournament/event/year/${year}`)
		console.log(res.data)

	}
	async function fetchTournament(id){
		try {
			const res = await axios.get(`/tournament/tournament/${id}/full`)
			tournament.value = res.data
			console.log(res.data)
		} catch(error){
			console.log(error)
		}

	}
	return { tournaments, 
			 tournament,
			 fetchTournaments,
			 fetchTournament,
			 fetchThisYear
	}
})
