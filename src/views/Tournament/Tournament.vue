<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import PrivateTournamentCard from '@/components/Tournament/PrivateTournamentCard.vue';
import TournamentCard from '@/components/Tournament/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { getOngoingEvents, getPrivateTournaments } = tournamentStore;
const { ongoingEvents, privateTournamentsList } = storeToRefs(tournamentStore);
const event = computed(() => ongoingEvents.value.at(-1));
const tournaments_id = computed(() => event.value?.tournaments);

await getOngoingEvents();
await getPrivateTournaments();
</script>

<template>
  <div>
    <div v-if="!tournaments_id" class="flex justify-center">
      Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
    </div>
    <div class="mb-4 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-3">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
    <div class="mb-4 flex justify-center">
      <router-link
        to="/archives"
        class="btn-primary"
      >
        Voir les anciennes éditions
      </router-link>
    </div>
  </div>
  <div v-if="Object.keys(privateTournamentsList).length > 0">
    <h1 class="title">
      Tournois privés
    </h1>
    <div class="mb-4 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-3">
      <PrivateTournamentCard
        v-for="tournament in privateTournamentsList"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>
  </div>
</template>
