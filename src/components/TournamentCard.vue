<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import type { Tournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();

const props = defineProps<{
  id: number;
}>();

const { getTournament } = storeToRefs(tournamentStore);
const tournament = ref<Tournament>();

onMounted(async () => {
  tournament.value = await getTournament.value(props.id);
});

// TODO: make a ts struct fetched from api
const maxTeam = ref(32);
</script>
<template>
  <div class="grid place-items-center gap-2 bg-cyan-900 shadow-lg">
    <img
      :alt="`Logo du ${tournament?.name}`"
      :src="tournament?.logo"
      class="aspect-video w-screen text-clip"
    />
    <p>
      {{ tournament?.teams.length }}/{{ maxTeam }} Équipes | Cashprize:
      {{ tournament?.cashprizes?.reduce((acc, val) => acc += val, 0) }}
    </p>
    <div class="mb-3 flex w-2/3 justify-between">
      <a :href="`tournament/${tournament?.id as number}`" class="rounded border-2 border-green-600 p-2">Plus d'infos</a>
      <a :href="`tournament/${tournament?.id as number}/register`" class="center rounded bg-green-600 p-2">S'inscrire</a>
      <!-- TODO: turns button into component-->
    </div>
  </div>
</template>
