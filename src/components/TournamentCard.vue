<script setup lang="ts">
import { ref } from 'vue';
import type { Tournament } from '@/models/tournament';

defineProps<{
  tournament: Tournament;
}>();

// TODO: make a ts struct fetched from api
const maxTeam = ref(32);
const cashprize = ref(1000000);
</script>
<template>
  <div class="max-w-1/3 min-w-1/3 container h-min bg-cyan-900 shadow-lg">
    <img :src="tournament.logo" class="w-full text-clip" :alt="tournament.name"/>
    <div>
      <p class="pt-1 text-center">
        {{ tournament.teams.length }}/{{ maxTeam }} Equipes | Cashprize: {{ cashprize }}
      </p>
    </div>
    <div class="flex flex-col place-items-center pb-3">
      <a class="pb-2 text-zinc-400" href="#">Règlement du tournoi</a>
      <a :href="`tournament/${tournament.id}/register`" class="center rounded bg-green-600 p-2">S'inscrire</a> <!-- TODO: turns button into component-->
    </div>
  </div>
</template>
<style scoped>
</style>
