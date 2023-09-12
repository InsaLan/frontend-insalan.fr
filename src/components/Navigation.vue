<script setup lang="ts">
import { useUserStore } from '../stores/user.store';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
		
const items = [
	{ url:"/public", text:"Public"},
	{ url:"/tournament", text:"Tournois"},
	{ url:"/infos", text:"Informations pratiques"},
	{ url:"/eat", text: "Restauration"},
] as const;

const userStore = useUserStore()
const { logout } = userStore
const { isConnected, user } = storeToRefs(userStore)

const logout_user = () => { logout() }
console.log(isConnected)
</script>

<template>
<nav class="z-10 flex justify-around h-24 sticky top-0">
	<router-link class="mt-4" to="/"><img class="h-[69px] w-[69px]" src="../assets/images/logo_home.png"/></router-link>
	<div class="my-auto" >
		<router-link class="transition duration-150 ease-in-out font-bold text-white mx-4 hover:text-blue-800" v-for="(item, i) in items" :key="i" :to="{ path:item.url}">{{item.text}}</router-link>
	</div>
	<div v-if="!isConnected" class="my-auto">
		<router-link to="/register" class="rounded transition duration-150 ease-in-out p-2 font-bold text-white hover:bg-blue-800">Se connecter/S'inscrire</router-link>

	</div>
	<div v-else class="my-auto">
		<router-link class="transition duration-150 ease-in-out font-bold text-white mx-4 hover:text-blue-800" to="me">Mon compte</router-link>

		<button @click="logout_user()" class="transition duration-150 ease-in-out p-2 font-bold text-white hover:bg-blue-800">Se deconnecter</button>
	</div>
</nav>
</template>

<style scoped>

</style>
