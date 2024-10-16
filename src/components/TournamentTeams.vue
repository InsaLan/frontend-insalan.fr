<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TeamCard from '@/components/TeamCard.vue';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;

getTournamentTeams();

const { tourney_teams, soloGame } = storeToRefs(tournamentStore);
</script>

<template>
  <section id="teams">
    <h1 v-if="props.tournament?.teams.length === 0" class="mt-6 text-center text-4xl">
      Aucune équipe inscrite
    </h1>
    <div v-if="tourney_teams?.validated_teams.length > 0">
      <h1 class="title">
        Équipes validées
      </h1>
      <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <TeamCard
          v-for="team in tourney_teams.validated_teams"
          :key="team.id"
          :team="team"
          :solo-game="soloGame"
        />
      </div>
    </div>
    <div v-if="tourney_teams?.non_validated_teams.length > 0">
      <h1 class="title">
        Équipes en cours de validation
      </h1>
      <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <TeamCard
          v-for="team in tourney_teams.non_validated_teams"
          :key="team.id"
          :team="team"
        />
      </div>
    </div>
  </section>
</template>
