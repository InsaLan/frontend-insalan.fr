<script setup lang="ts">
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
const userStore = useUserStore()
const { user, role, isConnected, inscriptions } = storeToRefs(userStore)
const { fetch_user_inscription_full } = userStore

fetch_user_inscription_full(user.value.id)

const placeholder = "/src/assets/images/logo_home.png"
</script>

<template>
	<div class="flex md:flex-row flex-col ml-1">
		<div id="profile" class="md:w-1/4 items-center">
			<h1 class="text-center m-3 font-bold text-4xl">Mon compte </h1>
			<div class="myr-2 flex flex-col md:justify-items-start justify-items-center md:place-items-start place-items-center">
				<div class="my-2 flex md:flex-row flex-col justify-items-center place-items-center">
					<div class="m-2 flex justify-items-center place-items-center">
						<a href=""><img class="m-2 rounded-full max-w-full max-h-full w-16 hover:blur-sm" :src="user.image ? user.image : placeholder"/></a>
					</div>
					<div>
						<p class="text-xl">Pseudo : <em>{{user.username}}</em>
							<a href="" class="hover:text-blue-600">
								<fa-awesome-icon class="ml-2" size="2xs" icon="fa-solid fa-pencil" />
							</a>
						</p>
						<p class="text-xl">Email : <em>{{user.email}}</em>
							<a href="" class="hover:text-blue-600">
								<fa-awesome-icon class="ml-2" size="2xs" icon="fa-solid fa-pencil" />
							</a>
						</p>
						<p class="text-xl">Mot de passe : <em>**********</em>
							<a href="" class="hover:text-blue-600">
								<fa-awesome-icon class="ml-2" size="2xs" icon="fa-solid fa-pencil" />
							</a>
						</p>
						<div class="flex justify-items-center place-items-center"><p class="text-xl">Role : </p>
							<div class="m-1 pr-1 flex justify-around text-md bg-blue-700 rounded p-1 w-16">
								<svg v-if="role=='dev'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
									<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
								</svg>
								{{role}}
							</div>
						</div>
					</div>
				</div>
				<div class="myr-2 ml-1">	
					<button @click="delete_account()" class="center rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-red-600 hover:ring hover:ring-pink-500" style="display: flex; align-items: center;">Supprimer son compte</button>
				</div>
			</div>
		</div>
		<div class="h-auto bg-white w-[2px]"></div>
		<div id="team" class="md:w-3/4">
			<h1 class="text-center m-3 font-bold text-4xl">Mes Equipes </h1>
			<!--div>
				<div class="bg-red-900 rounded-xl text-center m-2 text-xl" v-if="Object.keys(inscriptions.unpaid).length">
					<h2 class="mx-5 text-xl" v-if="Object.keys(inscriptions.unpaid).length == 1"><fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez une inscription non payée  <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
					<h2 class="mx-5 text-xl" v-else><fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez des inscriptions non payées  <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
				</div>
			</div-->
			<div class="m-4" v-if="inscriptions.ongoing.length > 0">
				<h1 class="text-xl">Edition Actuelle</h1>
				<div class="m-1 grid md:grid-cols-4 gap-3">
					<div class="container flex flex-col-reverse max-w-xs break-words bg-cyan-900 text-center" :class="{ /*[`bg-red-900`]: inscriptions.unpaid[inscription.team.id]*/ }" v-for="inscription in inscriptions.ongoing" :href="'/team/' + inscription.team.id + '/detail'">
						<div class="md:visible collapse my-1">
							<div class="h-8 flex flex-col flex-1 justify-center m-1">
								<div>
									<a
									href="" 
									:class="{[`bg-red-600`]: inscriptions.unpaid[inscription.team.id], [`bg-green-600`]: !inscriptions.unpaid[inscription.team.id]}" 
									class="center rounded transition duration-150 ease-in-out p-2 font-bold text-white hover:ring hover:ring-pink-500">
									{{ inscriptions.unpaid[inscription.team.id] ? "Terminer l'inscription" : inscription.team.players[0]==user.id ? "Gérer l'équipe" : "Voir l'équipe"}}
									</a>
								</div>
							</div>
						</div>
						<div class="md:visible collapse flex flex-col">
							<a href="" class="text-zinc-400 mt-auto">réglement du tournois</a>
						</div>
						<img class="h-32 max-w-full w-32 overflow-hidden" :src="inscription.team.tournament.logo" style="width: 100%; object-fit: cover;"/>
						<div class="flex flex-col flex-1 justify-center m-1">
							<p class="text-xl">{{inscription.team.name}}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="m-4" v-if="inscriptions.past.length > 0">
				<h1 class="text-xl">Autres Editions</h1>
				<div class="m-1 grid md:grid-cols-4 gap-3">
					<div class="container flex flex-col-reverse max-w-xs break-words bg-cyan-900 text-center" v-for="inscription in inscriptions.past" :href="'/team/' + inscription.team.id + '/detail'">
						<div class="md:visible collapse my-1">
							<div class="h-8 flex flex-col flex-1 justify-center m-1">
								<div>
									<a
									href="" 
									class="bg-green-600 center rounded transition duration-150 ease-in-out p-2 font-bold text-white hover:ring hover:ring-pink-500">
									{{ inscription.team.players[0]==user.id ? "Gérer l'équipe" : "Voir l'équipe"}}
									</a>
								</div>
							</div>
						</div>
						<div class="md:visible collapse flex flex-col">
							<a href="" class="text-zinc-400 mt-auto">réglement du tournois</a>
						</div>
						<img class="h-32 max-w-full w-32 overflow-hidden" :src="inscription.team.tournament.logo" style="width: 100%; object-fit: cover;"/>
						<div class="flex flex-col flex-1 justify-center m-1">
							<p class="text-xl">{{inscription.team.name}}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

