<script setup lang="ts">
import SwissRoundTable from '@/components/Tournament/SwissRoundTable.vue';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();
</script>

<template>
  <section class="u-m-1 l-flex-column l-items-cross-center md:m-4 lg:m-8">
    <div v-for="swiss in tournament?.swissRounds" :key="swiss.id" class="flex u-full-width overflow-x-auto u-pb-2">
      <SwissRoundTable
        :swiss="swiss"
        :team-per-match="tournament?.game.team_per_match"
      />
    </div>
  </section>
</template>
