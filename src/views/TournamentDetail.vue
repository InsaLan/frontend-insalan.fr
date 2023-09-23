<script setup lang="ts">
import { useTournamentStore } from '../stores/tournament.store'
import {storeToRefs } from 'pinia'
import TeamCard  from '../components/TeamCard.vue'
const tournamentStore = useTournamentStore()
const { fetchTournament } = tournamentStore
const { tournament } =storeToRefs(tournamentStore)
const props = defineProps(['id']) 

const res = fetchTournament(props.id)
console.log(res)
</script>

<template>
<div>

	<div class="text-4xl text-center text-white">{{tournament.name}}</div>
	<section id="infos">
	</section>
	<div class="grid md:grid-cols-2 grid-cols-1 p-5 gap-4">
		<TeamCard v-for="team in tournament.teams" :team="team" />
		<a href="#" class="flex flex-row justify-center items-center bg-red-500 rounded">
			<div class="text-center rounded bg-red-500">

				<fa-awesome-icon size="5x" icon="fa-solid fa-circle-plus" />
				<p class="text-center text-4xl">inscrire son équipe</p>
			</div>
		</a>
	</div>
</div>
</template>

