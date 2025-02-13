<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { between, integer, required } from '@vuelidate/validators';
import { computed, reactive, ref } from 'vue';
import { BracketType } from '@/models/bracket';
import { MatchTypeEnum } from '@/models/match';
import type { Team } from '@/models/team';
import type { TournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

import AdminMatch from './AdminMatch.vue';
import FormField from './FormField.vue';
import Modal from './Modal.vue';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const { addNotification } = useNotificationStore();

const {
  launchMatchs,
  get_col_style,
  get_matchs_per_round,
  get_winner_matchs_per_round,
  get_looser_matchs,
  get_bracket_cols_count,
  get_validated_team_by_id,
  createBracket,
  deleteBracket,
} = useTournamentStore();

const has_brackets = computed(() => tournament.brackets.length > 0);
const has_matchs = computed(() => has_brackets.value && tournament.brackets.some((b) => b.matchs.length > 0));

const team_per_match = computed(() => tournament.game.team_per_match);

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

const bracket_data = reactive({
  name: '',
  team_count: 0,
  bracket_type: BracketType.SINGLE,
});
const bracket_rules = computed(() => ({
  name: { required },
  team_count: { required, between: between(2, (tournament.teams as Team[]).filter((t) => t.validated).length) },
  bracket_type: { required },
}));

const v$ = useVuelidate(bracket_rules, bracket_data);

const create_bracket = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  await createBracket(tournament.id, bracket_data);

  modal_open.value = false;
  addNotification(`L'arbre ${bracket_data.name} a bien été créé.`, 'info');
};

const deleted_bracket = ref(0);

const open_delete_bracket_modal = (bracket_id: number) => {
  deleted_bracket.value = bracket_id;

  open_modal('delete_bracket');
};

const delete_bracket = async () => {
  const res = await deleteBracket(deleted_bracket.value);

  if (res) addNotification('L\'arbre à bien été supprimé.', 'info');

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
    between: between(1, 10),
  },
}));

const v_round$ = useVuelidate(round_rules, { round_to_launch });

const launch_round_matchs = async () => {
  const is_valid = await v_round$.value.$validate();

  if (!is_valid) return;

  await launchMatchs({ tournament: tournament.id, round: round_to_launch.value }, 'bracket');

  addNotification(`Les matchs du round ${round_to_launch.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

</script>

<template>
  <button
    type="button"
    class="m-2 rounded bg-blue-800 p-2 text-xl font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
    @click="open_modal('create_bracket')"
  >
    Créer un arbre
    <fa-awesome-icon
      icon="fa-solid fa-circle-plus"
    />
  </button>

  <div
    v-for="bracket in tournament.brackets"
    :key="bracket.id"
    class="mb-5"
  >
    <h1 class="title">
      Arbre {{ bracket.name }}
    </h1>

    <div
      class="m-4 flex flex-wrap justify-center gap-4 lg:mx-8 lg:gap-16"
    >
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
      <button
        type="button"
        class="rounded bg-red-500 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        @click="open_delete_bracket_modal(bracket.id)"
      >
        Supprimer l'arbre
      </button>
    </div>

    <div
      v-if="bracket.bracket_type === BracketType.SINGLE"
      :key="bracket.id"
      class="mx-4 overflow-x-auto"
    >
      <div
        class="grid items-center gap-x-10 gap-y-2"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)"
          :key="round_idx"
          class="flex h-full flex-col justify-around gap-4"
        >
          <AdminMatch
            v-for="game in games"
            :key="game.id"
            v-model="selected_matchs"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :team-per-match="team_per_match"
            :editable="true"
            :selectable="true"
          />
        </div>
        <div
          v-if="bracket.winner !== null"
          class="w-40 bg-yellow-600 p-2"
        >
          <h1
            class="text-bold text-center text-2xl"
          >
            Vainqueur
          </h1>
          <p
            class="text-center text-xl"
          >
            {{ get_validated_team_by_id(bracket.winner)?.name }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="bracket.bracket_type === BracketType.DOUBLE"
      :key="bracket.id"
      class="mx-4 overflow-x-auto"
    >
      <div
        class="grid h-full items-center gap-x-10 gap-y-2"
        :style="get_col_style(bracket)"
      >
        <div
          class="flex h-full flex-col justify-around gap-4"
        >
          <AdminMatch
            v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth)"
            :key="game.id"
            v-model="selected_matchs"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :team-per-match="team_per_match"
            :editable="true"
            :selectable="true"
          />
        </div>
        <div
          v-for="col_idx in get_bracket_cols_count(bracket) - 2"
          :key="col_idx"
          class="flex h-full flex-col"
        >
          <div
            v-if="col_idx % 2"
            class="flex h-full flex-col justify-around gap-4"
          >
            <AdminMatch
              v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth - (col_idx - 1) / 2 - 1)"
              :key="game.id"
              v-model="selected_matchs"
              :match="game"
              :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
              :team-per-match="team_per_match"
              :editable="true"
              :selectable="true"
            />
          </div>
        </div>
        <div
          v-if="bracket.winner !== null"
          class="w-40 bg-yellow-600 p-2"
        >
          <h1
            class="text-bold text-center text-2xl"
          >
            Vainqueur
          </h1>
          <p
            class="text-center text-xl"
          >
            {{ get_validated_team_by_id(bracket.winner)?.name }}
          </p>
        </div>
      </div>

      <div
        class="grid items-center gap-x-10 gap-y-2"
        :style="get_col_style(bracket)"
      >
        <div/>
        <div
          v-for="(games, round_idx) in get_looser_matchs(bracket.matchs)"
          :key="round_idx"
          class="flex h-full flex-col justify-around gap-4"
        >
          <AdminMatch
            v-for="game in games"
            :key="game.id"
            v-model="selected_matchs"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :team-per-match="team_per_match"
            :editable="true"
            :selectable="true"
          />
        </div>
        <div/>
      </div>
    </div>
  </div>

  <Modal
    v-if="modal_open && modal_type === 'create_bracket'"
  >
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3
        class="text-white-900 text-base font-semibold leading-6"
      >
        Créer un arbre
      </h3>
    </template>
    <template #body>
      <form
        id="generate_bracket_form"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="create_bracket"
      >
        <FormField
          v-slot="context"
          :validations="v$.name"
        >
          <label for="bracket_name">
            Nom de l'arbre
          </label>
          <input
            id="bracket_name"
            v-model="bracket_data.name"
            type="text"
            name="bracket_name"
            aria-label="Bracket's name"
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
          />
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.bracket_type"
        >
          <label for="bracket_type">
            Type d'arbre
          </label>
          <select
            id="bracket_type"
            v-model="bracket_data.bracket_type"
            :class="{ error: context.invalid }"
            aria-label="Bracket's type"
            class="ml-2 bg-inherit"
          >
            <option
              v-for="bracket_type in Object.keys(BracketType).filter((v) => !Number.isInteger(Number(v)))"
              :key="bracket_type"
              :value="bracket_type"
            >
              {{ bracket_type === BracketType.SINGLE ? 'Élimination direct' : 'Double élimination' }}
            </option>
          </select>
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.team_count"
        >
          <label for="bracket_team_count">
            Nombre d'équipes
          </label>
          <input
            id="bracket_team_count"
            v-model.number="bracket_data.team_count"
            name="bracket_team_count"
            class="ml-2 bg-inherit"
            type="number"
            :class="{ error: context.invalid }"
          />
        </FormField>
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="create_bracket"
      >
        Créer l'arbre
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
    v-if="modal_open && modal_type === 'delete_bracket'"
  >
    <template #title>
      <h3
        class="text-white-900 text-base font-semibold leading-6"
      >
        Supprimer l'arbre
      </h3>
    </template>
    <template #body>
      L'arbre va être supprimée ainsi que les matchs qui lui sont liés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_bracket"
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
</template>
