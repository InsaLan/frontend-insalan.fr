<script setup lang="ts">
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
getTournamentTeams();

</script>

<template>
  <router-link :to="{ name: 'tournament_admin_groups' }">
    Gérer les poules
  </router-link>
  <button type="button">
    Lancer les matchs
  </button>

  <button type="button">
    Sauvegarder les modifications
  </button>
</template>
