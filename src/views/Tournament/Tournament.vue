<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import PrivateTournamentCard from '@/components/Tournament/PrivateTournamentCard.vue';
import TournamentCard from '@/components/Tournament/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { getOngoingEvents, getPrivateTournaments } = tournamentStore;
const { ongoingEvents, privateTournaments } = storeToRefs(tournamentStore);
const event = computed(() => ongoingEvents.value.at(-1));
const tournaments_id = computed(() => event.value?.tournaments);

await getOngoingEvents();
await getPrivateTournaments();
</script>

<template>
  <div>
    <h1 class="title">
      Tournois
    </h1>
    <div v-if="!tournaments_id" class="flex justify-center">
      Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
    </div>
    <div class="mb-4 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
    <div class="mb-4 flex justify-center">
      <router-link
        to="/archives"
        class="rounded bg-blue-800 p-2 text-[clamp(0.9rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
      >
        Voir les anciennes éditions
      </router-link>
    </div>
  </div>
  <div v-if="Object.keys(privateTournaments).length > 0">
    <h1 class="title">
      Tournois privés
    </h1>
    <div class="mb-4 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
      <PrivateTournamentCard
        v-for="tournament in privateTournaments"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>
  </div>
</template>
