<script setup lang="ts">
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

import AdminGroupTable from './AdminGroupTable.vue';

defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
getTournamentTeams();

const create_groups = async () => {};

const create_matchs = async () => {};

const launch_round = async () => {};
</script>

<template>
  <div
    class="m-8 flex justify-center gap-16"
  >
    <div
      class="flex flex-col gap-8 sm:flex-row"
    >
      <button
        type="button"
        class="center rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        @click="create_groups"
      >
        Générer les poules
      </button>

      <button
        type="button"
        class="center rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        @click="create_matchs"
      >
        Créer les matchs
      </button>
    </div>
    <div
      class="flex flex-col gap-8 sm:flex-row"
    >
      <button
        type="button"
        class="center rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        @click="launch_round"
      >
        Lancer un round
      </button>

      <router-link
        :to="{ name: 'tournament_admin_groups-matchs' }"
        class="rounded bg-blue-800 p-2 text-center font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
      >
        Gérer les matchs
      </router-link>
    </div>
  </div>

  <div class="mb-10 flex flex-1 flex-wrap justify-center gap-20">
    <div
      v-for="(group, idx) in tournament.groups"
      :key="group.id"
      class="m-2 lg:m-0 lg:w-2/5"
    >
      <AdminGroupTable v-model="(tournament as TournamentDeref).groups[idx]"/>
    </div>
  </div>
</template>
