<script setup>
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
</script>
<template>
	<div id="profile">
		<h1> Mon compte </h1>
		<p>{{user.username}}</p>
		<p>{{user.email}}</p>
	</div>
	<div id="team">
		<h1> Mes Equipes </h1>
	</div>
</template>

