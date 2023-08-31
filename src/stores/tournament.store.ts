import { defineStore } from "pinia";
import { ref } from 'vue';
import axios from "axios";

export const useTournamentStore = defineStore('tournament', () => {
	let tournaments = ref({})

	async function fetchTournaments() {
		const res = await axios.get('/tournament/tournament/')
		console.log(res.data)

	}
	return { tournaments, 
			 fetchTournaments
	}
})
