<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
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
    addNotification('Les seeds doivent être unique', 'error');
    return;
  }

  const modified_seed = tourney_teams.value.validated_teams.reduce((res, team) => {
    if (team.seed !== seeding_form[team.id]) {
      res.push({ id: team.id, seed: seeding_form[team.id] });
    }
    return res;
  }, [] as { id: number; seed: number }[]);

  if (modified_seed.length === 0) {
    addNotification('Pas de modification', 'info');
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

  addNotification('Seed modifiés avec succès.', 'info');
};

</script>

<template>
  <section class="u-m-main l-flex-column l-gap-2">
    <h2 class="u-m-0 u-text-center">
      Liste des équipes et seeding
    </h2>
    <p class="u-m-text">
      Le seed d'une équipe doit être un entier compris entre 1 et
      {{ tournament.max_team_thresholds[tournament?.current_threshold_index] }}.
      Chaque seed doit être unique.
      Une équipe avec un seed de 0 sera ignorée lors des calculs faisant intervenir le seeding.
      <br><br>
      Toutes les équipes sans seed seront placées aléatoirement après toutes les équipes seedées.
    </p>
    <div class="l-flex-column l-cross-center">
      <div class="c-card-bg-2">
        <table>
          <thead>
            <tr>
              <th class="u-big-text">
                Équipe
              </th>
              <th class="u-big-text">
                Seed
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
      Sauvegarder
    </button>
  </section>
</template>

<style scoped>
.reasonable-width {
  max-width: 8rem;
}
</style>
