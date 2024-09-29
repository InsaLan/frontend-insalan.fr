<script setup lang="ts">
import type { TournamentDeref } from '@/models/tournament';
import { useContentStore } from '@/stores/content.store';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

const { getContent } = useContentStore();
</script>

<template>
  <section id="planning">
    <div class="m-1 flex justify-center rounded bg-cyan-900 p-2">
      Les plannings peuvent varier en fonction de l'avancement des tournois et sont donnés à titre indicatif.
    </div>
    <div v-if="!getContent(props.tournament?.planning)" class="flex justify-center">
      Le planning n'est pas encore disponible, revenez plus tard !
    </div>
    <div class="flex justify-center">
      <div class="m-2 overflow-auto overscroll-y-auto">
        <content :name="props.tournament?.planning"/>
      </div>
    </div>
  </section>
</template>
