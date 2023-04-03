<script setup lang="ts">
import Hero from '../components/Hero.vue' 
const info = [
	//TODO: fill
]
const tournaments = [] // fetch tournaments
</script>

<template>
<Hero/>
<div class="snap-y proximity overflow-hidden">
	<section  class="block w-screen h-screen snap-start">
	<div class="title text-white">Informations</div>
	</section>
	<section class="block w-screen h-screen snap-start">
	<div class="title text-white">Tournois</div>
	</section>
</div>
</template>

<style scoped>
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
