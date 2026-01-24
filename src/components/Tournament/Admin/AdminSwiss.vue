<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import { MatchTypeEnum } from '@/models/match';
import type { SwissRound } from '@/models/swiss';
import { useNotificationStore } from '@/stores/notification.store';
import { groupBy, useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  required,
} from '@/support/locales/errors.fr';

const { swiss } = defineProps<{
  swiss: SwissRound;
}>();

const { addNotification } = useNotificationStore();

const {
  launchMatchs,
  deleteSwiss,
  SwissFillRound,
} = useTournamentStore();

const roundCounts = computed(() => 2 * swiss.min_score - 1);

const has_matchs = computed(() => swiss.matchs.length > 0);

const selected_matchs = ref(new Set<number>());

const launch_selected_matchs = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  if (selected_matchs.value.size === 0) {
    addNotification('Aucun match sélectionné', 'info');
  }

  await launchMatchs([{ id: swiss.id, matchs: Array.from(selected_matchs.value) }], 'swiss');

  selected_matchs.value.clear();

  addNotification('Les matchs ont bien été lancés.', 'info');
};

const modal_open = ref(false);
const modal_type = ref('');

const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
};

const delete_swiss = async () => {
  const res = await deleteSwiss(swiss.id);

  if (res) addNotification('La ronde suisse a bien été supprimées.', 'info');

  modal_open.value = false;
};

const open_launch_round_modal = () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  open_modal('launch_round');
};

const round_to_launch = ref(1);
const round_rules = computed(() => ({
  round_to_launch: {
    required,
    integer,
    between: between(1, roundCounts.value),
  },
}));

const v_round$ = useVuelidate(round_rules, { round_to_launch });

const launch_round_matchs = async () => {
  const is_valid = await v_round$.value.$validate();

  if (!is_valid) return;

  await launchMatchs([{ id: swiss.id, round: round_to_launch.value }], 'swiss');

  addNotification(`Les matchs du round ${round_to_launch.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

const open_fill_round_modal = () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  open_modal('create_round');
};

const round_to_create = ref(2);
const create_round_rules = computed(() => ({
  round_to_create: {
    required,
    integer,
    between: between(2, roundCounts.value),
  },
}));
const v_create_round$ = useVuelidate(create_round_rules, { round_to_create });

const swiss_fill_round = async () => {
  const is_valid = await v_create_round$.value.$validate();

  if (!is_valid) return;

  await SwissFillRound(swiss.id, round_to_create.value);

  modal_open.value = false;
  addNotification(`Les matchs du tour ${round_to_create.value} ont bien été générés.`, 'info');
};

</script>

<template>
  <h1 class="title">
    {{ swiss.name }}
    <fa-awesome-icon
      icon="fa-solid fa-trash-can"
      size="xs"
      class="ml-3 text-red-500 hover:cursor-pointer hover:text-red-700"
      title="Supprimer l'arbre"
      @click="open_modal('delete_swiss')"
    />
  </h1>

  <div
    class="mx-4 flex flex-wrap justify-center gap-4 lg:mx-8 lg:gap-8"
  >
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
      @click="open_fill_round_modal"
    >
      Générer un tour
    </button>
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[has_matchs ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
      :disabled="!has_matchs"
      @click="open_launch_round_modal"
    >
      Lancer un tour
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
    class="mx-2 flex flex-col items-center md:mx-4 lg:mx-8"
  >
    <div
      class="grid size-full gap-x-10 gap-y-5"
      :style="{ 'grid-template-columns': `repeat(${roundCounts}, minmax(18rem,1fr))` }"
    >
      <h1
        v-for="round_idx in roundCounts"
        :key="round_idx"
        class="text-center text-3xl"
      >
        Tour {{ round_idx }}
      </h1>
      <div
        v-for="(round_matchs, round_idx) in groupBy(swiss.matchs, 'round_number')"
        :key="round_idx"
        class="flex flex-col gap-6"
      >
        <div
          v-for="(matchs, score_group) in groupBy(round_matchs, 'score_group')"
          :key="score_group"
          class="border-2 border-gray-500"
        >
          <div
            class="bg-gray-500 text-center"
          >
            <div
              v-if="Number(round_idx) <= swiss.min_score"
            >
              {{ Number(round_idx) - 1 - Number(score_group) }} - {{ score_group }}
            </div>
            <div v-else>
              {{ swiss.min_score - 1 - Number(score_group) }} -
              {{ Number(round_idx) - swiss.min_score + Number(score_group) }}
            </div>
          </div>

          <div
            class="flex flex-col items-center"
          >
            <div
              v-for="match in matchs"
              :key="match.id"
              class="w-full"
            >
              <MatchCard
                v-model="selected_matchs"
                :match="match"
                :match-type="{ type: MatchTypeEnum.SWISS, id: match.swiss }"
                :editable="true"
                :selectable="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

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

  <Modal v-if="modal_open && modal_type === 'launch_round'">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Lancer les matchs d'un tour
      </h3>
    </template>
    <template #body>
      <form
        id="create_groups_form"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="launch_round_matchs"
      >
        <FormField
          v-slot="context"
          :validations="v_round$.round_to_launch"
        >
          <label for="round">
            Numéro du tour
          </label>
          <input
            id="round"
            v-model="round_to_launch"
            type="number"
            name="round"
            aria-label="Round number"
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v_round$.round_to_launch.$touch"
          >
        </FormField>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="launch_round_matchs"
      >
        Lancer le tour
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

  <Modal v-if="modal_open && modal_type === 'create_round'">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Générer les matchs d'un tour.
        <br>
        Les résultats du tour précédant vont être utilisés pour produire les nouveaux matchs.
        <br>
        Les rencontres au sein d'un même groupe de score sont déterminé aléatoirement.
      </h3>
    </template>
    <template #body>
      <form
        id="create_groups_form"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="swiss_fill_round"
      >
        <FormField
          v-slot="context"
          :validations="v_create_round$.round_to_create"
        >
          <label for="round">
            Numéro du tour
          </label>
          <input
            id="round"
            v-model="round_to_create"
            type="number"
            name="round"
            aria-label="Round number"
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v_create_round$.round_to_create.$touch"
          >
        </FormField>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="swiss_fill_round"
      >
        Générer le tour
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
