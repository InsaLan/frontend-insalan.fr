<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import TeamCard from '@/components/TeamCard.vue';
import type { Team } from '@/models/team';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { fetchTournament } = tournamentStore;
const { tournament } = storeToRefs(tournamentStore);
const props = defineProps<{
  id: number;
}>();

onMounted(async () => {
  await fetchTournament(props.id);
});
</script>

<template>
  <div>
    <div class="text-center text-4xl text-white">
      {{ tournament !== undefined ? tournament.name : '' }}
    </div>
    <section id="infos"/>
    <div class="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
      <div v-if="tournament !== undefined">
        <TeamCard v-for="team in (tournament.teams as Team[])" :key="team.id" :team="team"/>
      </div>
      <a href="#" class="flex flex-row items-center justify-center rounded bg-red-500">
        <div class="rounded bg-red-500 text-center">

          <fa-awesome-icon size="5x" icon="fa-solid fa-circle-plus"/>
          <p class="text-center text-4xl">inscrire son équipe</p>
        </div>
      </a>
    </div>
  </div>
</template>
