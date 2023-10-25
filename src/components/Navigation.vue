<script setup lang="ts">
import { useUserStore } from '../stores/user.store';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'
const items = [
	{ url:"/public", text:"Public"},
	{ url:"/tournament", text:"Tournois"},
	{ url:"/info", text:"Informations pratiques"},
	{ url:"/eat", text: "Restauration"},
] as const;
const mobile_items = [
	{ url:"/", text:"Accueil"},
	{ url:"/public", text:"Public"},
	{ url:"/tournament", text:"Tournois"},
	{ url:"/info", text:"Informations pratiques"},
	{ url:"/eat", text: "Restauration"},

] as const;
const userStore = useUserStore()
const { logout } = userStore
const { isConnected, user } = storeToRefs(userStore)
const router = useRouter()
const logout_user = () => {
	router.push("/")
	logout()
}
let burger_menu = ref(false)
</script>
<template>
<nav class="z-10 h-24 sticky top-0  bg-theme-bg">
	<div id="desktop" class="border-b-2 border-white justify-around hidden md:flex">
		<router-link class="my-2" to="/"><img class="h-[69px] w-[69px]" src="../assets/images/logo_home.png"/></router-link>
		<div class="my-auto" >
			<router-link class="transition duration-150 ease-in-out font-bold text-white mx-2 hover:text-blue-800" v-for="(item, i) in items" :key="i" :to="{ path:item.url}">{{item.text}}</router-link>
		</div>
		<div v-if="!isConnected" class="my-auto">
			<router-link to="/register" class="block rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-blue-800 hover:ring hover:ring-pink-500">Se connecter/S'inscrire</router-link>

		</div>
		<div v-else class="my-auto">
			<router-link class="transition duration-150 ease-in-out font-bold text-white mx-4 hover:text-blue-800" to="/me">Mon compte</router-link>
			<button @click="logout_user()" class="rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-blue-800 hover:ring hover:ring-pink-500">Se deconnecter</button>
		</div>

	</div>
	<div class="md:hidden border-b-2 border-white">
		<div id="top" class="flex justify-between">
			<router-link class="my-2 h-16 w-16" to="/"><img class="min-h-[48px] min-w-[48px]" src="../assets/images/logo_home.png"/></router-link>
		<div class="flex center">
			<div class="flex gap-4">
				<div v-if="!isConnected" class="my-auto">
					<router-link to="/register" class="block text-xs md:text-base rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-blue-800 hover:ring hover:ring-pink-500">Se connecter/S'inscrire</router-link>
				</div>
				<div v-else class="my-auto">
					<router-link class="transition duration-150 ease-in-out font-bold text-white mx-4 hover:text-blue-800" to="/me">Mon compte</router-link>
					<button @click="logout_user()" class="rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-blue-800 hover:ring hover:ring-pink-500">Se deconnecter</button>
				</div>
				<button @click="burger_menu = !burger_menu" class="mx-auto hover:text-white text-center rounded text-gray-400 h-8 w-8 ring-2 ring-gray-400 my-auto mr-2">
					<svg v-if="!burger_menu" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" class="stroke-2 w-6 h-6 m-auto">
					  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					</svg>
					<svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="stroke-2 w-6 h-6 m-auto" >
					  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
		</div>
		<div class="flex flex-col bg-theme-bg" >
				<div v-if="burger_menu" class="text-white flex flex-col">
					<router-link class="transition py-5 text-center duration-150 ease-in-out font-bold text-white mx-2 hover:text-blue-800" v-for="(item, i) in items" :key="i" :to="{ path:item.url}">{{item.text}}</router-link>
				</div>
			</div>
	</div>
</nav>
</template>

<style scoped>

</style>
