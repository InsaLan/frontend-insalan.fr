<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TeamCard from '@/components/Tournament/TeamCard.vue';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

import ProgressBar from '../ProgressBar.vue';

const props = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;

getTournamentTeams();

const { tourney_teams, soloGame } = storeToRefs(tournamentStore);

const n_validated_teams = tourney_teams.value?.validated_teams.length || 0;
const max_validated_teams = props.tournament.max_team_thresholds[props.tournament.current_threshold_index];

const n_waiting_threshold = tourney_teams.value?.waiting_validation_teams.length;
const next_threshold = props.tournament.max_team_thresholds[props.tournament.current_threshold_index + 1]
  - props.tournament.max_team_thresholds[props.tournament.current_threshold_index];
</script>

<template>
  <section id="teams" class="u-m-main l-flex-column l-gap-4">
    <div v-if="props.tournament?.teams.length === 0" class="u-my-4 u-text-center u-big-text">
      Aucune équipe inscrite.
    </div>
    <div v-if="tourney_teams?.validated_teams.length > 0" class="l-flex-column l-gap-2">
      <div class="u-m-text l-flex-column l-gap-2">
        <h2 class="u-m-0 u-text-center">
          Équipes validées
        </h2>
        <div class="u-mx-4 progressbar-height">
          <progress-bar
            :bg-color-level="2"
            :quantity1="n_validated_teams"
            :max1="max_validated_teams"
            description1="équipes validées"
          />
        </div>
        <p>
          Les équipes validées ont rempli toutes les conditions pour participer au tournoi.
          Si votre équipe apparaît ici, félicitations !
        </p>
      </div>
      <div class="l-grid-4 l-gap-2">
        <TeamCard
          v-for="team in tourney_teams.validated_teams"
          :key="team.id"
          :team="team"
          :solo-game="soloGame"
        />
      </div>
    </div>
    <div v-if="tourney_teams?.waiting_validation_teams.length > 0" class="l-flex-column l-gap-2">
      <div class="u-m-text l-flex-column l-gap-2">
        <h2 class="u-text-center u-m-0">
          Équipes en attente du palier
        </h2>
        <div class="u-mx-4 progressbar-height">
          <progress-bar
            :bg-color-level="2"
            :quantity1="n_waiting_threshold"
            :max1="next_threshold"
            description1="équipes en attente du palier"
          />
        </div>
        <p>
          Les équipes en attente du palier ont rempli les conditions minimales mais
          doivent attendre que le prochain palier d'équipe soit atteint pour être validées.
          Encore <strong>{{ next_threshold - n_waiting_threshold }} autres équipes</strong>
          doivent remplir les conditions pour atteindre le prochain palier.
        </p>
      </div>
      <div class="l-grid-4 l-gap-2">
        <TeamCard
          v-for="team in tourney_teams.waiting_validation_teams"
          :key="team.id"
          :team="team"
        />
      </div>
    </div>
    <div v-if="tourney_teams?.non_validated_teams.length > 0" class="l-flex-column l-gap-2">
      <div class="u-m-text l-flex-column l-gap-2">
        <h2 class="u-text-center u-m-0">
          Équipes en cours de validation
        </h2>
        <p>
          Les équipes en cours de validation n'ont pas encore rempli les conditions nécessaires
          pour participer au tournoi. Pour être validées, il faut qu'au moins la moitié des membres
          de l'équipe aient payé leur inscription.
        </p>
      </div>
      <div class="l-grid-4 l-gap-2">
        <TeamCard
          v-for="team in tourney_teams.non_validated_teams"
          :key="team.id"
          :team="team"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.progressbar-height {
  height: 2.5rem;
}
</style>
