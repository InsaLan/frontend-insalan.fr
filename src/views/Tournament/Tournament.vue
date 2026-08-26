<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
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
  <div class="l-flex-column l-cross-center u-m-main">
    <div v-if="!tournaments_id">
      {{ $t('views.tournamentView.noTournament') }}
    </div>
    <div class="l-grid-3 l-gap-2 u-full-width">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
        :is-private="false"
      />
    </div>
    <router-link
      to="/archives"
      class="u-my-2 c-btn-primary"
    >
      {{ $t('views.tournamentView.seePastEditions') }}
    </router-link>
    <h1 v-if="Object.keys(privateTournamentsList).length > 0">
      {{ $t('views.tournamentView.privateTournaments') }}
    </h1>
    <div v-if="Object.keys(privateTournamentsList).length > 0" class="l-grid-3 l-gap-2 u-full-width">
      <TournamentCard
        v-for="tournament in privateTournamentsList"
        :id="tournament.id"
        :key="tournament.id"
        :is-private="true"
      />
    </div>
  </div>
</template>
