<script setup lang="ts">
import { ref } from 'vue';
import type { Tournament } from '@/models/tournament';

defineProps<{
  tournament: Tournament;
}>();

//TODO: make a ts struct fetched from api
const team = ref(2)
const maxTeam = ref(32)
const cashprize = ref(1000000)
const placeholder = "./src/assets/images/placeholder_tournament.webp"
const registerUrl = "tournament/"+tour.id+"/register"
const detailUrl = "tournament/"+tour.id
</script>
<template>
  <div class="max-w-1/3 min-w-1/3 container h-min bg-cyan-900 shadow-lg">
    <img :src="tour.logo" class="overflow-clip w-screen aspect-video"/>
    <div>
      <p class="pt-1 text-center">
        {{ tournament.teams.length }}/{{ maxTeam }} Equipes | Cashprize: {{ cashprize }}
      </p>
    </div>
    <div class="flex place-content-center pb-3">
      <a :href="detailUrl" class="p-2 mr-7 rounded border-green-600 border-2">Plus d'infos</a>
      <a :href="registerUrl" class="p-2 ml-7 bg-green-600 center rounded">S'inscrire</a> <!-- TODO: turns button into component-->
    </div>
  </div>
</template>
<style scoped>
</style>
