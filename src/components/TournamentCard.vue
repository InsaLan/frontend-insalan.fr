<script setup lang="ts">
import {ref} from 'vue';
//TODO: make a ts struct fetched from api
const team = ref(2)
const maxTeam = ref(32)
const cashprize = ref(1000000)
const placeholder = "./src/assets/images/placeholder_tournament.webp"
</script>
<template>
  <div class="max-w-1/3  container h-min bg-cyan-900 shadow-lg">
    <img :src="placeholder" class="max-w-1/3" />
    <div>
      <p  class="text-center">{{team}}/{{maxTeam}} Equipes | Cashprize: {{cashprize}}</p>
    </div>
    <div class="flex flex-col place-items-center">
      <a class="text-zinc-400" href="#">Règlement du tournoi</a>
      <button class="p-0">S'inscrire au tournoi</button> <!-- TODO: turns button into component-->
    </div>
  </div>
</template>
<style scoped>
</style>
