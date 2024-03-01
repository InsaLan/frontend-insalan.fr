<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TournamentCard from '@/components/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { fetchAllEvents } = tournamentStore;
const { oldEvents } = storeToRefs(tournamentStore);

await fetchAllEvents();
</script>

<template>
  <div>
    <h1 class="title">
      Archives
    </h1>
    <div v-if="oldEvents?.length === 0" class="flex justify-center">
      Aucune archive n'est disponible pour le moment, revenez plus tard !
    </div>
    <div
      v-for="event in oldEvents"
      :key="event.id"
    >
      <h2 class="text-center text-2xl">
        {{ event.name }} | {{ String(event.month).padStart(2, '0') + "/" + event.year }}
      </h2>
      <div class="mb-4 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
        <TournamentCard
          v-for="tournament in event.tournaments"
          :id="tournament"
          :key="tournament"
        />
      </div>
    </div>
  </div>
</template>
