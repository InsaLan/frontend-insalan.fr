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
  <div class="l-flex-column l-items-cross-center u-m-main">
    <div v-if="!tournaments_id">
      Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
    </div>
    <div class="l-grid-3 l-gap-2">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
    <router-link
      to="/archives"
      class="u-my-2 c-btn-primary"
    >
      Voir les anciennes éditions
    </router-link>
    <h1 v-if="Object.keys(privateTournamentsList).length > 0">
      Tournois privés
    </h1>
    <div v-if="Object.keys(privateTournamentsList).length > 0" class="l-grid-3 l-gap-2">
      <PrivateTournamentCard
        v-for="tournament in privateTournamentsList"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>
  </div>
</template>
