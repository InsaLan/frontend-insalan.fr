<script setup lang="ts">
import SwissRoundTable from '@/components/Tournament/SwissRoundTable.vue';
import type { TournamentDeref } from '@/models/tournament';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();
</script>

<template>
  <section class="m-2 flex flex-col items-center md:m-4 lg:m-8">
    <div v-for="swiss in tournament?.swissRounds" :key="swiss.id" class="flex w-full overflow-x-auto pb-4">
      <SwissRoundTable
        :swiss="swiss"
        :team-per-match="tournament?.game.team_per_match"
      />
    </div>
  </section>
</template>
