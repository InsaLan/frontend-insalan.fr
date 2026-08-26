<script setup lang="ts">
import Planning from '@/components/Planning.vue';
import type { EventTournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: EventTournamentDeref;
}>();

</script>

<template>
  <section id="planning">
    <div class="u-mb-2 u-m-text u-text-center u-color-text-2">
      Les plannings peuvent varier en fonction de l'avancement des tournois et sont donnés à titre indicatif.
    </div>
    <Planning :link="props.tournament?.planning_file"/>
  </section>
</template>
