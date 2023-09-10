<script setup lang="ts">
import { useTournamentStore } from '../stores/tournament.store'
import {storeToRefs } from 'pinia'
const tournamentStore = useTournamentStore()
const { fetchTournament } = tournamentStore
const { tournament } =storeToRefs(tournamentStore)
const props = defineProps(['id']) 

fetchTournament(props.id)
</script>

<template>
<div>
	<h1> Bienvenue sur le tournoi {{tournament.name}}</h1>
	<p> {{tournament.game.name}}</p>
	<ul>
		<li v-for="team in tournament.teams">{{team}}</li>
	</ul>
</div>
</template>
