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
        {{ event.name }} | {{ `${String(event.date_start.getMonth()).padStart(2, '0')}/${event.date_start.getFullYear()}` }}
      </h2>
      <div
        class="mx-2 mb-2 flex flex-col gap-4 px-4 md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        <img
          v-if="event.poster"
          :src="event.poster"
          class="w-full object-contain"
          :alt="`Poster ${event.name}`"
        />
        <div
          class=" mb-4 grid gap-4"
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
