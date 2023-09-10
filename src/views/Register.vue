<script setup>
</script>

<template>
	<div class="flex p-8">
		<div class="flex hover:bg-cyan-400 items-center flex-col basis-1/2">
			<h1 class="text-center text-4xl text-white">S'enregistrer</h1>
			<form class="my-5">
				<div class="flex flex-col">
					<label class="text-white" for="email">Email</label>
					<input class="border-2 bg-theme-bg" type="email" />
				</div>
				<div class="flex flex-col">
					<label class="text-white" for="16f78a7d6317f102bbd95fc9a4f3ff2e3249287690b8bdad6b7810f82b34ace3">Nom d'utilisateur</label>
					<input  class="border-2 bg-theme-bg" type="text" />
				</div>
				<div class="hidden flex flex-col">
					<label for="username">username</label>
					<input type="text" />
				</div>
				<div class="flex flex-col">
					<label  class="text-white" for="password">mot de passe</label>
					<input class="border-2 bg-theme-bg" type="password" />
				</div>
				<div class="flex flex-col">
					<label  class="text-white" for="password_confir">Repetition mot de passe</label>
					<input  class="border-2 bg-theme-bg" type="password" />
				</div>
				<div class="flex flex-row">
					<input class="border-2 bg-theme-bg" type="checkbox">
					<label class="text-white" for="accept">J'accepte les <a class="text-cyan-800" href="#">CGU</a> de l'insalan</label>
				</div>
			</form>
			<button @click="register" class="rounded-3xl bg-black text-white p-3">Creer un compte</button>
		</div>
		<div class="hover:bg-cyan-400 flex items-center flex-col basis-1/2">
			<h1 class="text-center text-4xl text-white">Se connecter</h1>
			<div class="" id="error" v-if="has_error">
				{{error}}
				<ul>
					<li v-for="e in error">{{e}}</li>
				</ul>
			</div>
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
			<button @click="login_user" class="rounded-3xl bg-black text-white mt-3 mx-auto p-3">Se connecter</button>
		</div>
	</div>
</template>
