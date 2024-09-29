<script setup lang="ts">
import SwissRoundTable from '@/components/SwissRoundTable.vue';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { swiss_match_results } = tournamentStore;
</script>

<template>
  <section class="mt-6 flex h-full justify-center">
    <div v-for="swiss in props.tournament?.swissRounds" :key="swiss.id" class="mx-3 overflow-x-auto">
      <SwissRoundTable
        :rounds="swiss_match_results(swiss.matchs)"
        :team-per-match="props.tournament?.game.team_per_match"
        :round-count="2 * swiss.min_score - 1"
      />
    </div>
  </section>
</template>
