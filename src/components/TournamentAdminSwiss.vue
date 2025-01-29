<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { integer, minValue, required } from '@vuelidate/validators';
import { computed, reactive, ref } from 'vue';
import { type Match, MatchStatus } from '@/models/match';
import type { TournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

import FormField from './FormField.vue';
import Modal from './Modal.vue';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const { addNotification } = useNotificationStore();

const {
  launchMatchs,
  get_validated_team_by_id,
  createSwiss,
  deleteSwiss,
} = useTournamentStore();

const roundCounts = computed(() => tournament.swissRounds.map((s) => 2 * s.min_score - 1));

const has_swiss = computed(() => tournament.swissRounds.length > 0);
const has_matchs = computed(() => has_swiss.value && tournament.swissRounds.some((s) => s.matchs.length > 0));

const selected_matchs = ref(new Set<number>());
const select_match = (match: Match) => {
  if (match.status === MatchStatus.SCHEDULED) {
    if (selected_matchs.value.has(match.id)) {
      selected_matchs.value.delete(match.id);
    } else {
      selected_matchs.value.add(match.id);
    }
  }
};

const launch_selected_matchs = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  if (selected_matchs.value.size === 0) {
    addNotification('Aucun match sélectionné', 'info');
  }

  await launchMatchs({ tournament: tournament.id, matchs: Array.from(selected_matchs.value) });

  selected_matchs.value.clear();

  addNotification('Les matchs ont bien été lancés.', 'info');
};

const modal_open = ref(false);
const modal_type = ref('');

const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
};

const swiss_data = reactive({
  min_score: 0,
  use_seeding: true,
});
const swiss_rules = computed(() => ({
  min_score: { integer, required, minValue: minValue(1) },
  use_seeding: { required },
}));

const v$ = useVuelidate(swiss_rules, swiss_data);

const generate_swiss = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  await createSwiss(tournament.id, swiss_data);

  modal_open.value = false;
  addNotification('La ronde suisse a bien été créées.', 'info');
};

const delete_swiss = async () => {
  const res = await deleteSwiss(tournament.id);

  if (res) addNotification('La ronde suisse a bien été supprimées.', 'info');

  modal_open.value = false;
};

const open_create_round_modal = () => {};

const open_launch_round_modal = () => {};

</script>

<template>
  <div
    class="m-4 flex flex-wrap justify-center gap-4 lg:m-8 lg:mb-0 lg:gap-16"
  >
    <button
      type="button"
      class="rounded p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
      :class="[has_swiss ? 'bg-red-500' : 'bg-blue-800']"
      @click="open_modal(has_swiss ? 'delete_swiss' : 'generate_swiss')"
    >
      {{ has_swiss ? 'Supprimer' : 'Générer' }} la ronde suisse
    </button>
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[has_swiss ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
      :disabled="!has_swiss"
      @click="open_create_round_modal"
    >
      Générer un round
    </button>
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[has_matchs ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
      :disabled="!has_matchs"
      @click="open_launch_round_modal"
    >
      Lancer un round
    </button>
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[has_matchs && selected_matchs.size > 0 ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
      :disabled="!has_matchs || selected_matchs.size === 0"
      @click="launch_selected_matchs"
    >
      Lancer les matchs séléctionnés
    </button>
  </div>

  <div
    v-for="(swiss, swiss_idx) in tournament.swissRounds"
    :key="swiss_idx"
    class="m-2 flex justify-center overflow-x-auto md:m-4 lg:m-8"
  >
    <div
      class="grid h-full items-center gap-x-20 gap-y-5"
      :style="{ 'grid-template-columns': `repeat(${roundCounts[swiss_idx]},31rem)` }"
    >
      <h1
        v-for="round_idx in roundCounts[swiss_idx]"
        :key="round_idx"
        class="text-center text-3xl"
      >
        Tour {{ round_idx }}
      </h1>
      <div
        v-for="round_idx in roundCounts[swiss_idx]"
        :key="round_idx"
        class="flex flex-col"
      >
        <table
          v-for="match in tournament.swissRounds[0].matchs.filter((m) => m.round_number === round_idx)"
          :key="match.id"
          class="border-separate rounded border px-2 pb-2"
          :class="[
            selected_matchs.has(match.id)
              ? 'border-4 border-blue-800'
              : 'm-[3px]',
            match.status === MatchStatus.SCHEDULED && !selected_matchs.has(match.id)
              ? 'hover:m-[2px] hover:border-2 hover:border-blue-800'
              : '',
          ]"
          @click="select_match(match)"
          @keypress="select_match(match)"
        >
          <tr>
            <th
              colspan="2"
              class="border-b-2"
            >
              <div
                class="grid w-full grid-cols-[1fr,2fr,1fr]"
              >
                <span class="text-left">BO {{ match.bo_type }}</span>

                <span v-if="match.status === MatchStatus.SCHEDULED" class="text-center text-blue-500">
                  <fa-awesome-icon
                    icon="fa-solid fa-clock"
                  />
                  Prévu
                </span>
                <span v-else-if="match.status === MatchStatus.ONGOING" class="text-center text-orange-500">
                  <fa-awesome-icon
                    icon="fa-solid fa-arrows-rotate"
                  />
                  En cours
                </span>
                <span v-else class="text-center text-green-500">
                  <fa-awesome-icon
                    icon="fa-solid fa-check"
                  />
                  Terminé
                </span>
              </div>
            </th>
          </tr>
          <tr
            v-for="team_id in match.teams"
            :key="team_id"
          >
            <td
              class="w-52 truncate"
            >
              {{ get_validated_team_by_id(team_id)?.name }}
            </td>
            <td
              class="w-6 text-right"
            >
              {{ match.score[team_id] }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <Modal
    v-if="modal_open && modal_type === 'generate_swiss'"
  >
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3
        class="text-white-900 text-base font-semibold leading-6"
      >
        Génération la ronde suisse
      </h3>
    </template>
    <template #body>
      <form
        id="generate_swiss_form"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="generate_swiss"
      >
        <FormField
          v-slot="context"
          :validations="v$.min_score"
        >
          <label for="min_score">
            Score de qualification
          </label>
          <input
            id="min_score"
            v-model="swiss_data.min_score"
            type="number"
            name="min_score"
            aria-label="Score for qualification"
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
          />
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.use_seeding"
        >
          <label for="seeding">
            Utiliser le seeding des équipes
          </label>
          <input
            id="seeding"
            v-model="swiss_data.use_seeding"
            :class="{ error: context.invalid }"
            aria-label="Use team seeding"
            class="ml-2 bg-inherit"
            type="checkbox"
          >
        </FormField>
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="generate_swiss"
      >
        Créer la ronde suisse
      </button>
      <button
        class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="modal_open = false;"
      >
        Annuler
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'delete_swiss'"
  >
    <template #title>
      <h3
        class="text-white-900 text-base font-semibold leading-6"
      >
        Supprimer la ronde suisse
      </h3>
    </template>
    <template #body>
      La ronde suisse va être supprimée ainsi que les matchs qui lui sont liés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_swiss"
      >
        Valider
      </button>
      <button
        class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="modal_open = false;"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>
