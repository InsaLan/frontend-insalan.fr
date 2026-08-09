<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import FormField from '@/components/FormField.vue';
import type { Team } from '@/models/team';
import type { EventTournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import { between, integer, required } from '@/support/locales/errors.fr';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref;
}>();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;
const { t } = useI18n();

const tournamentStore = useTournamentStore();
const { updateTeamsSeeding } = tournamentStore;
const { validated_teams } = storeToRefs(tournamentStore).tourney_teams.value;

const { tourney_teams } = storeToRefs(tournamentStore);

const seeding_form = reactive(tourney_teams.value.validated_teams.reduce((res, team) => {
  res[team.id] = team.seed;
  return res;
}, {} as Record<number, number>));

const rules = computed(() => tourney_teams.value.validated_teams.reduce((res, team) => {
  res[team.id] = {
    required,
    integer,
    between: between(0, validated_teams.length),
  };
  return res;
}, {} as Record<number, { required: ValidationRule; integer: ValidationRule; between: ValidationRule }>));

const v$ = useVuelidate(rules, seeding_form);

const save_seeds = async () => {
  const isValid = await v$.value.$validate();

  const non_zero = Object.values(seeding_form).filter((v) => v !== 0);

  const unique = new Set(non_zero);

  if (!isValid) return;

  if (unique.size !== non_zero.length) {
    addNotification(t('content.components.Tournament.Admin.TournamentAdminTeams.duplicateSeeds'), 'error');
    return;
  }

  const modified_seed = tourney_teams.value.validated_teams.reduce((res, team) => {
    if (team.seed !== seeding_form[team.id]) {
      res.push({ id: team.id, seed: seeding_form[team.id] });
    }
    return res;
  }, [] as { id: number; seed: number }[]);

  if (modified_seed.length === 0) {
    addNotification(t('content.components.Tournament.Admin.TournamentAdminTeams.noChanges'), 'info');
    return;
  }

  const res = await updateTeamsSeeding(modified_seed);

  const seed_mapping = (res.data as { id: number; seed: number }[]).reduce((ret, item) => {
    ret[item.id] = item.seed;
    return ret;
  }, {} as Record<number, number>);

  (tournament.teams as Team[]).forEach((team) => {
    if (team.id in seed_mapping) {
      team.seed = seed_mapping[team.id];
    }
  });

  addNotification(t('content.components.Tournament.Admin.TournamentAdminTeams.seedsUpdated'), 'info');
};

</script>

<template>
  <section class="u-m-main l-flex-column l-gap-2">
    <h2 class="u-m-0 u-text-center">
      {{ t('content.components.Tournament.Admin.TournamentAdminTeams.title') }}
    </h2>
    <p class="u-m-text">
      {{ t('content.components.Tournament.Admin.TournamentAdminTeams.seedDescription', { max: tournament.max_team_thresholds[tournament?.current_threshold_index] }) }}
      <br>
      {{ t('content.components.Tournament.Admin.TournamentAdminTeams.seedUnique') }}
      <br>
      {{ t('content.components.Tournament.Admin.TournamentAdminTeams.zeroSeedIgnored') }}
      <br><br>
      {{ t('content.components.Tournament.Admin.TournamentAdminTeams.unseededDescription') }}
    </p>
    <div class="l-flex-column l-cross-center">
      <div class="c-card-bg-2">
        <table>
          <thead>
            <tr>
              <th class="u-big-text">
                {{ t('content.common.team') }}
              </th>
              <th class="u-big-text">
                {{ t('content.components.Tournament.Admin.TournamentAdminTeams.seed') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="team in tourney_teams.validated_teams"
              :key="team.id"
            >
              <td>
                {{ team.name }}
              </td>
              <td class="reasonable-width">
                <FormField
                  :validations="v$[team.id]"
                >
                  <input
                    id="seed"
                    v-model="seeding_form[team.id]"
                    type="number"
                    min="1"
                    value="1"
                    :max="tournament.max_team_thresholds[tournament?.current_threshold_index]"
                    :class="{ 'u-color-warn-1': team.seed !== seeding_form[team.id] }"
                    @blur="v$[team.id].$touch"
                  >
                </FormField>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <button type="submit" class="c-btn-secondary" @click="save_seeds">
      {{ t('content.common.save') }}
    </button>
  </section>
</template>

<style scoped>
.reasonable-width {
  max-width: 8rem;
}
</style>
