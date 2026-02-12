<script setup lang="ts">
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useContentStore } from '@/stores/content.store';

const props = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();

const { md } = useContentStore();
</script>

<template>
  <section id="rules">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="u-m-text u-my-2" v-html="md.render(props.tournament?.rules)"/>
  </section>
</template>
