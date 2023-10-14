<script setup lang="ts">
	import { useTournamentStore } from '../stores/tournament.store';
	import FormField from '../components/FormField.vue';
	import { storeToRefs } from 'pinia';
	import { computed, reactive } from 'vue';
	import { required } from '@vuelidate/validators';
	import useVuelidate from '@vuelidate/core';

	const props = defineProps(['id']);
	const tournamentStore = useTournamentStore()
	
	const { tournaments } = storeToRefs(tournamentStore)
	const logo = "url(" + tournaments.value[props.id].logo + ")"


	const register_form = reactive({
		team: "",
		pseudo: ""
	})

	const rules = computed(() => {
		return {
			team: {required},
			pseudo: {required}
		}
	})

	const v$ = useVuelidate(rules, register_form, {autoDirty: true})

	let team_form = true
	const switch_form = (e :Event) => {
		if ((e.target?.id === "player-btn" && team_form) || (e.target?.id === "team-btn" && !team_form)) {
			team_form = !team_form
			const team_btn = document.getElementById("team-btn")
			const player_btn = document.getElementById("player-btn")
			const forms = document.getElementById("forms")
			
			if (team_form) {
				if (team_btn?.classList.contains("bg-gray-500")) {
					team_btn.classList.replace("bg-gray-500","bg-blue-400")
				}
				if (player_btn?.classList.contains("bg-blue-400")) {
					player_btn.classList.replace("bg-blue-400","bg-gray-500")
				}
				if (forms?.classList.contains("translatePlayer")) {
					forms.classList.remove("translatePlayer")
				}
			} else {
				if (team_btn?.classList.contains("bg-blue-400")) {
					team_btn.classList.replace("bg-blue-400","bg-gray-500")
				}
				if (player_btn?.classList.contains("bg-gray-500")) {
					player_btn.classList.replace("bg-gray-500","bg-blue-400")
				}
				forms?.classList.add('translatePlayer')
			}
		}
	}

	const register_team = () => {
		console.log("test")
	}
</script>

<template>
	<div class="main" style="height: calc(100vh - 6rem);">
		<div class="grid grid-cols-2 h-12">
			<div id="team-btn" class="bg-blue-400 flex items-center justify-center cursor-pointer hover:border-solid hover:border-2 hover:border-pink-500" @click="switch_form($event)">
				<button  class="text-xl">Créer une équipe</button>
			</div>
			<div id="player-btn" class="bg-gray-500 flex items-center justify-center cursor-pointer hover:border-solid hover:border-2 hover:border-pink-500" @click="switch_form($event)">
				<button class="text-xl">Rejoindre une équipe</button>
			</div>
		</div>
		<div class="overflow-hidden h-full">
			<div id="forms" class="grid transition" style="height: calc(100% - 2.5rem);grid-template-columns: repeat(2, 100vw);">
				<div class="flex items-center justify-center flex-col">
					<form>
						<FormField required label="Nom de l'équipe" v-slot="context" :validations="v$.team">
							<input :class="{error: context.invalid}" placeholder="Équipe 1" type="text" class="flex flex-col"/>
						</FormField>
						<FormField required label="Pseudo in game" v-slot="context" :validations="v$.team">
							<input :class="{error: context.invalid}" placeholder="xxxx" type="text" class="flex flex-col"/>
						</FormField>
					</form>
					<button @click="register_team" class="mt-10">Créer l'équipe</button>
				</div>
				<div class="flex items-center justify-center flex-col">
					<form>
						<FormField required label="Nom de l'équipe" v-slot="context" :validations="v$.team">
							<input :class="{error: context.invalid}" placeholder="Équipe 1" type="text" class="flex flex-col"/>
						</FormField>
						<FormField required label="Mot de passe de l'équipe" v-slot="context" :validations="v$.team">
							<input :class="{error: context.invalid}"  type="password" class="flex flex-col"/>
						</FormField>
						<FormField required label="Pseudo in game" v-slot="context" :validations="v$.team">
							<input :class="{error: context.invalid}" placeholder="xxxx" type="text" class="flex flex-col"/>
						</FormField>
					</form>
					<button @click="register_team" class="mt-10">Rejoindre l'équipe</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.main {
	background-image: v-bind(logo);
	background-size: cover;
}

.translatePlayer {
	transform: translateX(-100vw);
}
</style>