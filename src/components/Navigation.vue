<script setup lang="ts">
</script>

<template>
<nav>
	
	<router-link class="left" to="/"><img src="../assets/images/logo_home.png"/></router-link>
	<div id="menu" >
		<router-link to="/public">Public</router-link>
		<router-link to="/tournament">Tournois</router-link>
		<router-link to="/informations">Informations pratique</router-link>
		<router-link to="/eat">Restauration</router-link>
	</div>
	<div id="login">
		<button id="login">Se connecter</button>
		<button id="register">S'inscrire</button>
	</div>
</nav>
</template>

<style scoped>
button {
	padding: 1.2em;
	margin: 0.4em;
	border-radius: 6px;
	border: none;
}
#register {
background-color: #07742B;
}
.left > img {
	width: 69px;
	height: 69px;
	margin-left: 1em;
	margin-top: 1em;
}
a {
	color: #fff;
	font-weight:bold;
}
#menu > a {
	margin-left: 3em;
	margin-right: 3em;
}
nav {
	height: 5em;
	display: flex;
	position: relative;
	justify-content: space-between;
	z-index:3;
}
</style>
