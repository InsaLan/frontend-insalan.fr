<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import {
  BestofType,
  MatchTypeEnum,
} from '@/models/match';
import type { TournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { groupBy, useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  minValue,
  required,
} from '@/support/locales/errors.fr';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const { addNotification } = useNotificationStore();

const {
  launchMatchs,
  createSwiss,
  deleteSwiss,
  createSwissRound,
} = useTournamentStore();

const roundCounts = computed(() => tournament.swissRounds.map((s) => 2 * s.min_score - 1));

const has_swiss = computed(() => tournament.swissRounds.length > 0);
const has_matchs = computed(() => has_swiss.value && tournament.swissRounds.some((s) => s.matchs.length > 0));

const selected_matchs = ref(new Set<number>());

const launch_selected_matchs = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  if (selected_matchs.value.size === 0) {
    addNotification('Aucun match sélectionné', 'info');
  }

  await launchMatchs({ tournament: tournament.id, matchs: Array.from(selected_matchs.value) }, 'swiss');

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
  bo_type: BestofType.BO1,
});
const swiss_rules = computed(() => ({
  min_score: { integer, required, minValue: minValue(1) },
  use_seeding: { required },
  bo_type: { required },
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
    between: between(1, Math.max(...roundCounts.value)),
  },
}));

const v_round$ = useVuelidate(round_rules, { round_to_launch });

const launch_round_matchs = async () => {
  const is_valid = await v_round$.value.$validate();

  if (!is_valid) return;

  await launchMatchs({ tournament: tournament.id, round: round_to_launch.value }, 'swiss');

  addNotification(`Les matchs du round ${round_to_launch.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

const open_create_round_modal = () => {
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
    between: between(2, Math.max(...roundCounts.value)),
  },
}));
const v_create_round$ = useVuelidate(create_round_rules, { round_to_create });

const create_round = async () => {
  const is_valid = await v_create_round$.value.$validate();

  if (!is_valid) return;

  await createSwissRound(tournament.id, tournament.swissRounds[0].id, round_to_create.value);

  modal_open.value = false;
  addNotification(`Les matchs du tour ${round_to_create.value} ont bien été générés.`, 'info');
};

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
    class="m-2 flex flex-col items-center md:m-4 lg:m-8"
  >
    <div
      v-for="(swiss, swiss_idx) in tournament.swissRounds"
      :key="swiss_idx"
      class="flex w-full overflow-x-auto pb-4"
    >
      <div
        class="grid size-full gap-x-10 gap-y-5"
        :style="{ 'grid-template-columns': `repeat(${roundCounts[swiss_idx]}, minmax(18rem,1fr))` }"
      >
        <h1
          v-for="round_idx in roundCounts[swiss_idx]"
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
                  :team-per-match="tournament.game.team_per_match"
                  :editable="true"
                  :selectable="true"
                />
              </div>
            </div>
          </div>
        </div>
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
            @blur="v$.min_score.$touch"
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
            @blur="v$.use_seeding.$touch"
          >
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.bo_type"
        >
          <label for="bo_type">
            Type de BO
          </label>
          <select
            id="bo_type"
            v-model="swiss_data.bo_type"
            name="bo_type"
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v$.bo_type.$touch"
          >
            <option
              v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
              :key="value"
              :value="value"
            >
              {{ value === '0' ? 'Classement' : `BO ${value}` }}
            </option>
          </select>
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
        @submit.prevent="create_round"
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
        @click="create_round"
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
