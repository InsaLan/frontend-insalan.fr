<script setup lang="ts">
import { storeToRefs } from 'pinia'
import TournamentCard from '../components/TournamentCard.vue'
import { useTournamentStore } from '../stores/tournament.store'

const tournamentStore = useTournamentStore()
const { fetchThisYear, fetchTournaments } = tournamentStore
const { event } = storeToRefs(tournamentStore)
const { tournaments } = storeToRefs(tournamentStore)

if (event.value.length) {
    await fetchThisYear()
    if (event.value.length) {
	    await fetchTournaments(event.value.at(-1).tournaments)
    }
}
</script>

<template>
<div v-if="Object.keys(tournaments).length" class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 xl:w-full px-4">
    <TournamentCard v-for="tournament in tournaments" :tournament="tournament"/>
</div>
<div v-else>
    Les tournois n'ont pas encore été annoncé, Revenez plus tard !
</div>
</template>