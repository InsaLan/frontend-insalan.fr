<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import { useTournamentStore } from '../stores/tournament.store';
import TournamentCard from './TournamentCard.vue';

const tournamentStore = useTournamentStore();
const { fetchThisYear, fetchTournaments } = tournamentStore;
const { event } = storeToRefs(tournamentStore);
const { tournaments } = storeToRefs(tournamentStore);

onMounted(async () => {
  await fetchThisYear();
  if (event.value.length) {
    await fetchTournaments(event.value.at(-1)?.tournaments as number[]);
  }
});
</script>

<template>
  <div v-if="Object.keys(tournaments).length" class="grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
    <TournamentCard v-for="tournament in tournaments" :key="tournament.id" :tournament="tournament"/>
  </div>
  <div v-else>
    Les tournois n'ont pas encore été annoncé, Revenez plus tard !
  </div>
</template>
