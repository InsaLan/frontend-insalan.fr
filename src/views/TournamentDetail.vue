<script setup lang="ts">
import { useTournamentStore } from '../stores/tournament.store'
import {storeToRefs } from 'pinia'
import TeamCard  from '../components/TeamCard.vue'
const tournamentStore = useTournamentStore()
const { fetchTournament } = tournamentStore
const { tournament } = storeToRefs(tournamentStore)
const props = defineProps(['id'])

const res = fetchTournament(props.id)
console.log(res)

const switch_tag = (e: Event) => {
	const target = e.target as HTMLInputElement
	const drop = document.getElementById("dropdown")
	if (target.classList.contains("opened")) {
		target.classList.remove("opened")
		drop?.classList.remove("opened")
	} else {
		target.classList.add("opened")
		drop?.classList.add("opened")
	}
}

const select_tag = (e: Event) => {
	const btn = document.getElementById("dropdown-btn")
	const drop = document.getElementById("dropdown")

	if (btn !== null) {
		btn.innerHTML = (e.target as HTMLInputElement).innerHTML
	}

	if (btn?.classList.contains("opened")) {
		btn?.classList.remove("opened")
	}
	drop?.classList.remove("opened")
}
</script>

<template>
<div class="flex flex-col items-center" style="height: calc();">
	<div class="text-6xl text-center text-white font-bold">{{tournament.name}}</div>

	<nav class="flex justify-center w-screen my-4">
		<button id="dropdown-btn" class="md:hidden text-xl" @click="switch_tag">Informations</button>
		<div id="dropdown">
			<a @click="select_tag" href="#infos">Informations</a>
			<a @click="select_tag" href="#teams">Équipes</a>
			<a @click="select_tag" href="#groups">Poules</a>
			<a @click="select_tag" href="#brackets">Arbres</a>
			<a @click="select_tag" href="#planning">Planning</a>
			<a @click="select_tag" href="#rules">Règlement</a>
		</div>
	</nav>

	<div class="flex w-screen overflow-hidden">
	<div class="pager grid">
		<section id="infos">
			Blablablabla
		</section>

		<section id="teams">
		<div class="grid md:grid-cols-2 grid-cols-1 p-5 gap-4">
			<TeamCard v-for="team in tournament.teams" :team="team" />
			<a href="#" class="flex flex-row justify-center items-center bg-red-500 rounded">
				<div class="text-center rounded bg-red-500">

					<fa-awesome-icon size="5x" icon="fa-solid fa-circle-plus" />
					<p class="text-center text-4xl">inscrire son équipe</p>
				</div>
			</a>
		</div>
		</section>

		<section id="groups">

		</section>

		<section id="brackets">

		</section>

		<section id="planning">

		</section>

		<section id="rules">

		</section>
	</div>
</div>
</div>
</template>

<style scoped>
section {
	width: 100%;
}

a {
	@apply text-xl
}

.pager {
	grid-template-columns: repeat(6, 100vw);
}

#dropdown-btn::after {
	display: inline-block;
	content: "\2039";
	inline-size: 1em;
	transform-origin: center center;
	transform: rotate(-90deg);
}

.opened#dropdown-btn::after {
	transform: translateX(5px) rotate(90deg);
}

.opened#dropdown {
	display:flex;
}

#dropdown {
	@apply flex justify-between w-screen md:w-2/3 xl:w-1/2
}

@media (max-width: 768px) {
	#dropdown {
		display: none;
		position: absolute;
		transform: translateY(2rem);
		z-index: 99;
		background-color: #2C292D;
		width: 100vw;
		flex-direction: column;
		align-items: center;
	}
}
</style>
