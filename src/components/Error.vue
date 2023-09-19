<script setup>
import { useUserStore } from '../stores/user.store'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
const { errors, has_error } = storeToRefs(userStore)
console.log(errors)
</script>
<template>
	<div v-if="has_error" class="rounded bg-red-600 border-solid border-2 p-2 border-red-700">
		<h1>Erreur</h1>		
	</div>
</template>
