<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Planning from '@/components/Planning.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { ongoingEvents } = storeToRefs(tournamentStore);
const { fetchOngoingEvents } = tournamentStore;

await fetchOngoingEvents();
</script>

<template>
  <div class="m-5 overflow-auto overscroll-y-auto">
    <Planning
      :link="ongoingEvents?.[0]?.planning_file"
    />
  </div>
</template>
