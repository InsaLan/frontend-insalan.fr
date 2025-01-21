<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Planning from '@/components/Planning.vue';
import { useContentStore } from '@/stores/content.store';
import { useTournamentStore } from '@/stores/tournament.store';

const contentStore = useContentStore();
const { getContent } = contentStore;

const tournamentStore = useTournamentStore();
const { ongoingEvents } = storeToRefs(tournamentStore);
const { fetchOngoingEvents } = tournamentStore;

await fetchOngoingEvents();
</script>

<template>
  <div v-if="!getContent('planning')" class="flex justify-center">
    Le planning n'est pas encore disponible, revenez plus tard !
  </div>
  <div class="">
    <div class="m-5 overflow-auto overscroll-y-auto">
      <Planning
        :link="ongoingEvents[0].planning_file"
      />
    </div>
  </div>
</template>
