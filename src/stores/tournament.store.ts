import { defineStore } from "pinia";
import { computed, ref } from 'vue';
import axios from "axios";

const groupBy = (items, key) => items.reduce(
  (result, item) => ({
    ...result,
    [item[key]]: [
      ...(result[item[key]] || []),
      item,
    ],
  }), 
  {},
);

export const useTournamentStore = defineStore('tournament', () => {
	let events = ref({})
	let event = ref({})
	let tournaments = ref({})
	let tournament = ref({})
	
	async function fetchEvents() {
		try {
			const res = await axios.get('/tournament/event')
			const ev = res.data
			const years = groupBy(ev, 'year')
			events.value = years
			//console.log(years)
			} catch(error) {
			console.log(error)	
		}
	}
	async function fetchThisYear() {
		const year = new Date().getFullYear()
		const res = await axios.get(`/tournament/event/year/${year}`)
		event.value = res.data
		//console.log(res.data)

	}
	async function fetchTournaments(ids) {
		tournaments.value = {}
		for (const id of ids) {
			try{
				const res = await axios.get(`/tournament/tournament/${id}`)
				tournaments.value[id] = res.data
			} catch(err) {
				console.log(err)
			}
		}
	}
	async function fetchTournamentFull(id){
		try {
			const res = await axios.get(`/tournament/tournament/${id}/full`)
			tournament.value = res.data
			console.log(res.data)
		} catch(error){
			console.log(error)
		}

	}
	async function fetchTournament(id){
		try {
			const res = await axios.get(`/tournament/tournament/${id}`)
			tournament.value = res.data
			console.log(res.data)
		} catch(error){
			console.log(error)
		}

	}
	//const archives = computed(() => events.value.filter((event) => event.year <= new Date().getFullYear()))
	return { events,
		event,
		tournaments,
		tournament,
		fetchEvents,
		fetchTournament,
		fetchTournamentFull,
		fetchThisYear,
		fetchTournaments,
	}
})
