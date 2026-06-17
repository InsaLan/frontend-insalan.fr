<script setup lang="ts">
import Seating from '@/components/Tournament/SeatingPlan.vue';
import type { EventTournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: EventTournamentDeref;
}>();

</script>

<template>
  <div class="u-m-main">
    <Seating
      :tournament="props.tournament"
      :team="null"
    />
  </div>
</template>
