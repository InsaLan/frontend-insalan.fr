<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

import GroupTable from './GroupTable.vue';

defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
getTournamentTeams();

const { tourney_teams } = storeToRefs(tournamentStore);
</script>

<template>
  <router-link :to="{ name: 'tournament_admin_groups-matchs' }">
    Gérer les matchs
  </router-link>
  <button type="button">
    Générer les poules
  </button>

  <button type="button">
    Générer les matches
  </button>

  <button type="button">
    Générer les matches
  </button>

  <GroupTable :teams="tourney_teams" :group="tournament.groups[0]"/>
</template>
