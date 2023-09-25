<script setup>
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
const userStore = useUserStore()
const { user, role, isConnected } = storeToRefs(userStore)

</script>
<template>
	<div class="flex ml-1">
		<div id="profile" class="w-1/3">
			<h1 class="text-xl">Mon compte </h1>
			<p>Pseudo: <em>{{user.username}}</em></p>
			<p>Email: <em>{{user.email}}</em></p>
			<div class="flex justify-around text-md bg-blue-700 rounded p-1 w-16">
				<svg v-if="role=='dev'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
				</svg>
				{{role}}</div>
		</div>
		<div id="team" class="w-1/3">
			<h1 class="text-xl">Mes Equipes </h1>
		</div>
		<div id="settings" class="w-1/3">
			<h1 class="text-xl">Réglages</h1>
		</div>
	</div>
</template>

