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
    <div v-if="!tournaments_id" class="flex l-items-main-center">
      Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
    </div>
    <div class="u-mb-2 grid u-full-width l-gap-2 u-px-2 md:grid-cols-2 xl:grid-cols-3">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
    <div class="u-mb-2 flex l-items-main-center">
      <router-link
        to="/archives"
        class="c-btn-primary"
      >
        Voir les anciennes éditions
      </router-link>
    </div>
  </div>
  <div v-if="Object.keys(privateTournamentsList).length > 0">
    <h1 class="c-title">
      Tournois privés
    </h1>
    <div class="grid u-full-width l-gap-2 u-px-2 md:grid-cols-2 xl:grid-cols-3">
      <PrivateTournamentCard
        v-for="tournament in privateTournamentsList"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>
  </div>
</template>
