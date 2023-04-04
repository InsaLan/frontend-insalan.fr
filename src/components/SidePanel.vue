<script setup lang="ts">

defineProps<{
	type: String
}>();
</script>

<template>
<aside v-if="type == 'login'" class="z-40 fixed right-0 bg-theme-bg w-1/4 h-screen">
	<div class="flex items-center flex-col p-8 m-4">
		<h1 class="text-center text-4xl text-white">Se connecter</h1>
		<form class="my-2">
			<div class="flex flex-col">
				<label class="text-white" for="email">Email</label>
				<input class="border-2 bg-theme-bg" type="email" />
			</div>
			<div class="flex flex-col">
				<label class="text-white" for="password">mot de passe</label>
				<input class="border-2 bg-theme-bg" type="password" />
			</div>
		</form>
		<button class="rounded-3xl bg-black text-white mt-3 mx-auto p-3">Se connecter</button>
		<p class="mt-4 text-white">Pas de compte? <a class="text-blue-800" href="#">S'inscrire</a></p>
	</div>
</aside>
<aside v-else-if="type == 'register'" class="z-40 fixed right-0 bg-theme-bg w-1/4 h-screen">
	<h1 class="text-center text-2xl text-white">Se creer un compte</h1>
	<div class="flex items-center flex-col p-8 m-4">
		<form class="my-5">
			<div class="flex flex-col">
				<label class="text-white" for="email">Email</label>
				<input type="email" />
			</div>
			<div class="flex flex-col">
				<label class="text-white" for="username">Nom d'utilisateur</label>
				<input  type="text" />
			</div>
			<div class="flex flex-col">
				<label  class="text-white" for="password">mot de passe</label>
				<input class="text-white" type="password" />
			</div>
			<div class="flex flex-col">
				<label  class="text-white" for="password_confir">Repetition mot de passe</label>
				<input type="password" />
			</div>
		</form>
		<button class="rounded-3xl bg-black text-white p-3">Creer un compte</button>
		<p class="text-white">Deja inscrit? <a class="text-blue-800" href="#">connectez-vous</a></p>
	</div>
</aside>
<aside v-else class="hidden">
</aside>


</template>

