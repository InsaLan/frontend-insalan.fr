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
    <div class="mx-auto my-4 w-[min(1080px,90%)] text-justify" v-html="md.render(props.tournament?.rules)"/>
  </section>
</template>
