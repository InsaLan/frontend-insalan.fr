<script setup lang="ts">
	const props = defineProps(['team'])
</script>

<template>
	<div class="bg-cyan-500 rounded  text-ellipsis overflow-hidden">
		<h1 class="text-center font-black text-xl">{{team.id}}. {{team.name}}</h1>
		<ul class="mx-1">
			<li v-for="player in team.players"> <p class="">{{player}}</p></li>
		</ul>
		<p class="text-grey-400">Managers: <em v-for="manager in team.managers">manager</em> </p>
	</div>
</template>
