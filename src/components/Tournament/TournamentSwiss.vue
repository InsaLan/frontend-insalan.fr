<script setup lang="ts">
import SwissRoundTable from '@/components/Tournament/SwissRoundTable.vue';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();
</script>

<template>
  <section
    id="swiss_rounds"
  >
    <SwissRoundTable
      v-for="swiss in tournament?.swissRounds"
      :key="swiss.id"
      :swiss="swiss"
    />
  </section>
</template>
