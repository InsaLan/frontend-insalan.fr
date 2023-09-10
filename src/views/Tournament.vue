<script setup lang="ts">
import { useTournamentStore } from '../stores/tournament.store';
import { storeToRefs } from 'pinia';
const tournamentStore = useTournamentStore()
const { fetchTournaments } = tournamentStore
const { tournaments } =storeToRefs(tournamentStore)
fetchTournaments()
</script>

<template>
<div>
	<h1> Tournois </h1>
	<ul>
		<li v-for="tournament in tournaments">
			{{tournament.name}}
		</li>
	</ul>
</div>
</template>
