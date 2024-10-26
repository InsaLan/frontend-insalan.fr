<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
getTournamentTeams();

const { tourney_teams } = storeToRefs(tournamentStore);

const save_seeds = async () => {
  console.log("test")
};

</script>

<template>
  <h4 class="py-4 text-center text-2xl">
    Liste des équipes et seeding
  </h4>
  {{ tournament.teams }}
  <table class="mx-auto my-4 border-2 lg:w-3/5">
    <colgroup>
      <col class="w-4/5"/>
      <col class="w-1/5"/>
    </colgroup>
    <thead>
      <tr>
        <th>Équipe</th>
        <th>Seed</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="team in tourney_teams.validated_teams"
        :key="team.id"
      >
        <td class="border p-2">
          {{ team.name }}
        </td>
        <td align="center" class="border">
          <label for="seed" class="hidden"/>
          <input id="seed" v-model="team.seed" type="number" class="bg-inherit border-0" min="1" :max="tournament.maxTeam">
        </td>
      </tr>
    </tbody>
  </table>
  <button type="submit" class="mx-auto rounded bg-blue-800 p-2 text-xl font-bold text-white transition duration-150 ease-in-out hover:bg-blue-700">
    Sauvegarder
  </button>
</template>

<style>
input::-webkit-inner-spin-button,::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
