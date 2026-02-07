<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TournamentCard from '@/components/Tournament/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { fetchAllEvents } = tournamentStore;
const { oldEvents } = storeToRefs(tournamentStore);

await fetchAllEvents();
</script>

<template>
  <div>
    <h1 class="c-title">
      Archives
    </h1>
    <div v-if="oldEvents?.length === 0" class="flex l-items-main-center">
      Aucune archive n'est disponible pour le moment, revenez plus tard !
    </div>
    <div
      v-for="event in oldEvents"
      :key="event.id"
    >
      <h2 class="u-text-center text-2xl">
        {{ event.name }} | {{ event.date_start.toLocaleDateString() }}
      </h2>
      <div
        class="u-mx-1 u-mb-1 l-flex-column l-gap-2 u-px-2 md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        <img
          v-if="event.poster"
          :src="event.poster"
          class="u-full-width object-contain"
          :alt="`Poster ${event.name}`"
        />
        <div
          class=" u-mb-2 grid l-gap-2"
          :class="{
            'col-span-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4': !event.poster,
            'col-span-1 md:grid-cols-1 xl:col-span-2 xl:grid-cols-2 2xl:col-span-3 2xl:grid-cols-3': event.poster,
          }"
        >
          <div
            v-for="tournament in event.tournaments"
            :key="tournament"
          >
            <TournamentCard
              :id="tournament"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
