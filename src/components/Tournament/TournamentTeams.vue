<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import TeamCard from '@/components/Tournament/TeamCard.vue';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

import ProgressBar from '../ProgressBar.vue';

const props = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
const { t } = useI18n();

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
      {{ t('components.tournament.tournamentTeams.noRegisteredTeam') }}
    </div>
    <div v-if="tourney_teams?.validated_teams.length > 0" class="l-flex-column l-gap-2">
      <div class="u-m-text l-flex-column l-gap-2">
        <h2 class="u-m-0 u-text-center">
          {{ t('components.tournament.tournamentTeams.validatedTeamsTitle') }}
        </h2>
        <div class="u-mx-4 progressbar-height">
          <progress-bar
            :bg-color-level="2"
            :quantity1="n_validated_teams"
            :max1="max_validated_teams"
            :description1="t('components.tournament.tournamentTeams.validatedTeamsTitle').toLocaleLowerCase()"
          />
        </div>
        <p>
          {{ t('components.tournament.tournamentTeams.validatedTeamsDescription') }}
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
          {{ t('components.tournament.tournamentTeams.waitingThresholdTitle') }}
        </h2>
        <div class="u-mx-4 progressbar-height">
          <progress-bar
            :bg-color-level="2"
            :quantity1="n_waiting_threshold"
            :max1="next_threshold"
            :description1="t('components.tournament.tournamentTeams.waitingThresholdTitle').toLocaleLowerCase()"
          />
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="t('components.tournament.tournamentTeams.waitingThresholdDescription', { count: next_threshold - n_waiting_threshold })"/>
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
          {{ t('components.tournament.tournamentTeams.validatingTeamsTitle') }}
        </h2>
        <p>
          {{ t('components.tournament.tournamentTeams.validatingTeamsDescription') }}
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
