<script setup lang="ts">
import Planning from '@/components/Planning.vue';
import type { TournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

</script>

<template>
  <section id="planning">
    <div class="m-1 flex justify-center rounded bg-cyan-900 p-2">
      Les plannings peuvent varier en fonction de l'avancement des tournois et sont donnés à titre indicatif.
    </div>
    <div
      class="m-4"
    >
      <Planning :link="props.tournament?.planning_file"/>
    </div>
  </section>
</template>
