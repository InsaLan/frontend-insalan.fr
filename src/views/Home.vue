<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Footer from '../components/Footer.vue'
import Hero from '../components/Hero.vue' 
import TournamentCard from '../components/TournamentCard.vue'
import { useTournamentStore } from '../stores/tournament.store';
</script>

<template>
<Hero/>
<div class="snap-y proximity overflow-hidden">
	<section  class="block w-screen h-screen snap-start">
		<div class="title text-white">Informations</div>
	</section>
	<div class="title text-white">Tournois</div>
	<section class="grid grid-cols-3 gap-4 block mx-5 w-screen h-screen snap-start">
	<TournamentCard />
	<TournamentCard />
	</section>
	<div class="title text-white">Cosplay</div>
	<section class="block w-screen h-screen snap-start">
	</section>
	<Footer />
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
