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
  {{ tournament.brackets }}
</template>
