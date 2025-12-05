<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TeamCard from '@/components/Tournament/TeamCard.vue';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
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
        Équipes validées (
        {{ tourney_teams.validated_teams.length }}/{{ props.tournament.max_team_thresholds[
          props.tournament.current_threshold_index
        ] }}
        )
      </h1>
      <span class="mb-4 block text-center text-sm text-gray-600 dark:text-gray-400">
        Les équipes validées ont rempli toutes les conditions pour participer au tournoi.
        Si votre équipe apparaît ici, félicitations !
      </span>
      <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <TeamCard
          v-for="team in tourney_teams.validated_teams"
          :key="team.id"
          :team="team"
          :solo-game="soloGame"
        />
      </div>
      <!-- Progression vers le prochain palier -->
      <div
        v-if="
          props.tournament.current_threshold_index + 1
            < props.tournament.max_team_thresholds.length
        "
        class="mt-4 text-center"
      >
        <p>
          Prochain palier :
          {{
            tourney_teams.waiting_validation_teams.length
          }}/{{ props.tournament.max_team_thresholds[
            props.tournament.current_threshold_index + 1
          ] - props.tournament.max_team_thresholds[
            props.tournament.current_threshold_index
          ] }}
          équipes validées
        </p>
        <label
          class="sr-only mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          for="team-progress"
        >
          Progression vers le prochain palier :
        </label>
        <progress
          id="team-progress"
          class="progress progress-primary w-1/2 rounded-lg"
          :value="tourney_teams.waiting_validation_teams.length"
          :max="props.tournament.max_team_thresholds[
            props.tournament.current_threshold_index + 1
          ] - props.tournament.max_team_thresholds[
            props.tournament.current_threshold_index
          ]"
        />
        <div
          v-if="
            tourney_teams.waiting_validation_teams.length
              >= props.tournament.max_team_thresholds[
                props.tournament.current_threshold_index + 1
              ] - props.tournament.max_team_thresholds[
                props.tournament.current_threshold_index
              ]
          "
        >
          <span class="text-sm font-medium text-green-600 dark:text-green-400">
            Le palier peut être étendu par le staff du tournoi, merci de patienter.
          </span>
        </div>
      </div>
    </div>
    <div v-if="tourney_teams?.waiting_validation_teams.length > 0">
      <h1 class="title">
        Équipes en attente du palier ({{ tourney_teams.waiting_validation_teams.length }})
      </h1>
      <span class="mb-4 block text-center text-sm text-gray-600 dark:text-gray-400">
        Les équipes en attente du palier ont rempli les conditions minimales mais
        doivent attendre que le prochain palier d'équipe soit atteint pour être validées.
      </span>
      <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <TeamCard
          v-for="team in tourney_teams.waiting_validation_teams"
          :key="team.id"
          :team="team"
        />
      </div>
    </div>
    <div v-if="tourney_teams?.non_validated_teams.length > 0">
      <h1 class="title">
        Équipes en cours de validation ({{ tourney_teams.non_validated_teams.length }})
      </h1>
      <span class="mb-4 block text-center text-sm text-gray-600 dark:text-gray-400">
        Les équipes en cours de validation n'ont pas encore rempli les conditions nécessaires
        pour participer au tournoi.
        <br/>
        Pour être validées, il faut que la moitié des membres
        de l'équipe aient payé leur inscription.
      </span>
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
