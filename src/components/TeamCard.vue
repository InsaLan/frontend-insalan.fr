<script setup>
	const props = defineProps(['team'])
</script>

<template>
	<div class="bg-cyan-500 rounded">
		<h1 class="text-center font-black text-xl">{{team.id}}. {{team.name}}</h1>
		<ul class="mx-1">
			<li v-for="player in team.players"> <p>{{player}}</p></li>
		</ul>
		<p class="text-grey-400">Managers: <em v-for="manager in team.managers">manager</em> </p>
	</div>
</template>
