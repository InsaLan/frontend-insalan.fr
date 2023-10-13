<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Footer from '../components/Footer.vue'
import Hero from '../components/Hero.vue' 
import TournamentCard from '../components/TournamentCard.vue'
import { useTournamentStore } from '../stores/tournament.store'

const tournamentStore = useTournamentStore()
const { fetchThisYear, fetchTournaments, fetchTournament } = tournamentStore

fetchThisYear()

const { event} = storeToRefs(tournamentStore)

fetchTournaments(event.value[0].tournaments)

const { tournaments } = storeToRefs(tournamentStore)
console.log(tournaments)
</script>

<template>
<div class="snap-y snap-mandatory overflow-scroll" style="height: calc(100vh - 6rem)">
	<section class="w-screen snap-start" style="height: calc(100vh - 6rem);">
		<Hero/>
		<div class="title text-white">Informations</div>
	</section>
	<section class="snap-start" style="height: calc(100vh - 6rem)">
		<div class="title text-white my-2">Tournois</div>
		<div class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 xl:w-full px-4">
			<TournamentCard v-for="tournament in tournaments" :tournament="tournament"/>
		</div>
	</section>
	<section class="snap-start" style="height: calc(100vh - 6rem)">
		<div class="title text-white my-2">Cosplay</div>
	</section>
</div>
</template>

<style>
.title {
	font-size: 2em;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
}
.title::after, .title::before {
	content: '';
	display: block;
	height: 0.1em;
	background-color: #fff;
	min-width: 35vw;
}
.title::before {
	margin-right: 1em;
}
.title::after {
	margin-left: 1em;
}
</style>
