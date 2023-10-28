<script setup lang="ts">
import { ref } from 'vue';
import type { Tournament } from '@/models/tournament';

const props = defineProps<{
  tournament: Tournament;
}>();

// TODO: make a ts struct fetched from api
const maxTeam = ref(32);
const cashprize = ref(1000000);
const registerUrl = `tournament/${props.tournament.id}/register`;
const detailUrl = `tournament/${props.tournament.id}`;
</script>
<template>
  <div class="grid place-items-center gap-2 bg-cyan-900 shadow-lg">
    <img :src="props.tournament.logo" class="aspect-video w-screen text-clip" :alt="`Logo du ${props.tournament.name}`"/>
    <p>{{ props.tournament.teams.length }}/{{ maxTeam }} Equipes | Cashprize: {{ cashprize }}</p>
    <div class="mb-3 flex w-2/3 justify-between">
      <a :href="detailUrl" class="rounded border-2 border-green-600 p-2">Plus d'infos</a>
      <a :href="registerUrl" class="center rounded bg-green-600 p-2">S'inscrire</a> <!-- TODO: turns button into component-->
    </div>
  </div>
</template>
<style scoped>
</style>
