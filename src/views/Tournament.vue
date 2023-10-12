<script setup lang="ts">
import { useTournamentStore } from '../stores/tournament.store';
import { storeToRefs } from 'pinia';
const tournamentStore = useTournamentStore()
const { fetchEvents, fetchThisYear } = tournamentStore

fetchThisYear()

const { events } = storeToRefs(tournamentStore)
console.log(events.value)
</script>

<template>
<div>
	<h1 class="title"> Tournois </h1>
	<ul>
		<li v-for="event in events">{{event}}</li>	
	</ul>
</div>
</template>
