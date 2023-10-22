<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Hero from '../components/Hero.vue' 
import Partners from '../components/Partners.vue'
import TournamentCard from '../components/TournamentCard.vue'
import { useTournamentStore } from '../stores/tournament.store'

const placeholder = import.meta.env.VITE_PLACEHOLDER==1 ? true : false

const tournamentStore = useTournamentStore()
const { fetchThisYear, fetchTournaments, fetchTournament } = tournamentStore

fetchThisYear()

const { event} = storeToRefs(tournamentStore)

fetchTournaments(event.value[0].tournaments)

const { tournaments } = storeToRefs(tournamentStore)
console.log(tournaments)
</script>

<template>
<div>
	<section v-if="placeholder">
		<div class="title text-white">Informations</div>
		<div class="flex flex-col md:mb-10">
			<h class="text-center">
				Malheureusement, les inscriptions ne sont pas encore ouvertes.
			</h>
			<h class="text-center">
				Vous pouvez cependant vous créer un compte pour être tenu au courant de l'ouverture des inscriptions aux tournois.
			</h>
			<button class="mx-auto my-4 rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-blue-800 hover:ring hover:ring-pink-500" @click="$router.push('/register')">Créer un compte</button>
		</div>
	</section>
	<section class="w-screen" style="height: calc(100vh - 6rem);" v-if="!placeholder">
		<Hero/>
		<div class="title text-white">Informations</div>
	</section>
	<section v-if="!placeholder">
		<div class="title text-white my-2">Tournois</div>
		<div class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 xl:w-full px-4 mb-12">
			<TournamentCard v-for="tournament in tournaments" :tournament="tournament"/>
		</div>
	</section>
	<section>
		<Partners />
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
	min-width: calc(35vw - 3em);
}
.title::before {
	margin-right: 1em;
}
.title::after {
	margin-left: 1em;
}
</style>
