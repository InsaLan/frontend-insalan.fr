<script setup lang="ts">
import {ref} from 'vue'

const tournament = defineProps(["tournament"])
const tour = tournament.tournament

//TODO: make a ts struct fetched from api
const team = ref(2)
const maxTeam = ref(32)
const cashprize = ref(1000000)
const placeholder = "./src/assets/images/placeholder_tournament.webp"
const registerUrl = "tournament/"+tour.id+"/register"
</script>
<template>
  <div class="max-w-1/3 min-w-1/3 container h-min bg-cyan-900 shadow-lg">
    <img :src="tour.logo" class="w-full overflow-clip"/>
    <div>
      <p class="text-center pt-1">{{tour.teams.length}}/{{maxTeam}} Equipes | Cashprize: {{cashprize}}</p>
    </div>
    <div class="flex flex-col place-items-center pb-3">
      <a class="text-zinc-400 pb-2" href="#">Règlement du tournoi</a>
      <a :href="registerUrl" class="p-2 bg-green-600 center rounded">S'inscrire</a> <!-- TODO: turns button into component-->
    </div>
  </div>
</template>
<style scoped>
</style>
