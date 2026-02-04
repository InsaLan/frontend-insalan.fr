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
  <h4 class="u-py-2 u-text-center text-2xl">
    Liste des équipes et seeding
  </h4>
  <p class="u-mx-2 u-text-center">
    Le seed d'une équipe doit être un entier compris entre 1 et
    {{ tournament.max_team_thresholds[tournament?.current_threshold_index] }}.
    Chaque seed doit être unique.
    Une équipe avec un seed de 0 sera ignorer lors des calculs faisant intervenir le seeding.
    <br>
    Toutes les équipes sans seed seront placées aléatoirement après toutes les équipes seedées.
  </p>
  <div class="flex l-items-main-center">
    <table class="u-m-2 u-full-width border-2 lg:w-3/5">
      <colgroup>
        <col class="w-4/5"/>
        <col class="w-1/5"/>
      </colgroup>
      <thead>
        <tr>
          <th class="border-2 u-p-1 text-xl">
            Équipe
          </th>
          <th class="border-2 u-p-1 text-xl">
            Seed
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="team in tourney_teams.validated_teams"
          :key="team.id"
        >
          <td class="border u-p-1">
            {{ team.name }}
          </td>
          <td align="center" class="border p-1">
            <FormField
              v-slot="context"
              :validations="v$[team.id]"
              class="l-flex-column"
            >
              <input
                id="seed"
                v-model="seeding_form[team.id]"
                type="number"
                class="border-2 bg-inherit u-text-center"
                :class="{ error: context.invalid, 'text-orange-300': team.seed !== seeding_form[team.id], 'text-red-500': context.invalid }"
                @blur="v$[team.id].$touch"
              >
            </FormField>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <button type="submit" class="mx-auto u-mb-4 rounded bg-blue-800 u-p-1 text-xl u-bold text-white transition duration-150 ease-in-out hover:bg-blue-700" @click="save_seeds">
    Sauvegarder
  </button>
</template>

<style>
input[type="number"] {
  appearance: textfield;
}
</style>
