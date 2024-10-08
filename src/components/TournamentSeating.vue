<script setup lang="ts">
import Seating from '@/components/SeatingPlan.vue';
import type { TournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

</script>

<template>
  <Seating
    :tournament="props.tournament"
    :team="null"
  />
</template>
