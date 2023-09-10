import { defineStore } from "pinia";
import { ref } from 'vue';
import axios from "axios";

export const useTournamentStore = defineStore('tournament', () => {
	let tournaments = ref({})
	let tournament = ref({})
	async function fetchTournaments() {
		axios.get('/tournament/tournament/').then((res)=>{
			tournaments.value = res.data
		})

	}
	async function fetchTournament(id){
		try {
			const res = await axios.get(`/tournament/tournament/${id}`)
			tournament.value = res.data
			const game_data = await axios.get(`/tournament/game/${res.data.game}`)
			tournament.value.game = game_data.data
		} catch(error){
			console.log(error)
		}

	}
	return { tournaments, 
			 tournament,
			 fetchTournaments,
			 fetchTournament
	}
})
