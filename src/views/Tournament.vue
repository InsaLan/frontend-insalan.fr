<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import TournamentCard from '@/components/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { getOngoingEvents } = tournamentStore;
const { ongoingEvents } = storeToRefs(tournamentStore);
const event = computed(() => ongoingEvents.value.at(-1));
const tournaments_id = computed(() => event.value?.tournaments);

onMounted(async () => {
  await getOngoingEvents();
});

</script>

<template>
  <div>
    <h1 class="title">
      Tournois
    </h1>
    <div class="mb-12 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
  </div>
</template>
