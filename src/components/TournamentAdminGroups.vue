<script setup lang="ts">
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

import AdminGroupTable from './AdminGroupTable.vue';

defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
getTournamentTeams();
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

  <div class="mb-10 flex flex-1 flex-wrap justify-center gap-20">
    <div
      v-for="(group, idx) in tournament.groups"
      :key="group.id"
      class="m-2 lg:m-0 lg:w-2/5"
    >
      <AdminGroupTable v-model="(tournament as TournamentDeref).groups[idx]"/>
    </div>
  </div>
</template>
