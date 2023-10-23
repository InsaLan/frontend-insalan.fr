<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { fetchThisYear } = tournamentStore;

onMounted(async () => {
  await fetchThisYear();
});

const { events } = storeToRefs(tournamentStore);
</script>

<template>
  <div>
    <h1 class="title">
      Tournois
    </h1>
    <ul>
      <li v-for="(event, key) in events" :key="key">
        {{ event }}
      </li>
    </ul>
  </div>
</template>
