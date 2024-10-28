<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { integer, maxValue, minValue } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
import FormField from '@/components/FormField.vue';
import type { TournamentDeref } from '@/models/tournament';
import { useErrorStore } from '@/stores/error.store';
import { useTournamentStore } from '@/stores/tournament.store';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const ErrorStore = useErrorStore();
const { add_error } = ErrorStore;

const tournamentStore = useTournamentStore();
const { getTournamentTeams } = tournamentStore;
getTournamentTeams();

const { tourney_teams } = storeToRefs(tournamentStore);

const seeding_form = reactive(tourney_teams.value.validated_teams.reduce((res, item) => {
  res[item.id] = item.seed;
  return res;
}, {} as Record<number, number>));

const rules = computed(() => tourney_teams.value.validated_teams.reduce((res, item) => {
  res[item.id] = {
    integer,
    minValueValue: minValue(0),
    maxValueRef: maxValue(tournament.maxTeam),
  };
  return res;
}, {} as Record<number, ValidationRule>));

const v$ = useVuelidate(rules, seeding_form);

const save_seeds = async () => {
  const isValid = await v$.value.$validate();

  const non_zero = Object.values(seeding_form).filter((v) => v !== 0);

  const unique = new Set(non_zero);

  if (!isValid) return;

  if (unique.size !== non_zero.length) {
    add_error('Les seeds doivent être unique');
  }
};

</script>

<template>
  <h4 class="py-4 text-center text-2xl">
    Liste des équipes et seeding
  </h4>
  {{ tournament.teams }}
  {{ seeding_form }}
  <p class="text-center">
    Le seed d'une équipe doit être un entier compris entre 1 et {{ tournament.maxTeam }}.
    Chaque seed doit être unique.
    Une équipe avec un seed de 0 sera ignorer lors des calculs faisant intervenir le seeding.
    Toutes les équipes sans seed seront placées aléatoirement après toutes les équipes seeder.
  </p>
  <table class="mx-auto my-4 border-2 lg:w-3/5">
    <colgroup>
      <col class="w-4/5"/>
      <col class="w-1/5"/>
    </colgroup>
    <thead>
      <tr>
        <th class="border-2">
          Équipe
        </th>
        <th class="border-2">
          Seed
        </th>
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
          <FormField
            v-slot="context"
            :validations="v$[team.id]"
          >
            <label for="seed" class="hidden"/>
            <input id="seed" v-model="seeding_form[team.id]" type="number" class="border-0 bg-inherit text-center" :class="{ error: context.invalid }">
          </FormField>
        </td>
      </tr>
    </tbody>
  </table>
  <button type="submit" class="mx-auto rounded bg-blue-800 p-2 text-xl font-bold text-white transition duration-150 ease-in-out hover:bg-blue-700" @click="save_seeds">
    Sauvegarder
  </button>
</template>

<style>
input[type="number"] {
  appearance: textfield;
}
</style>
