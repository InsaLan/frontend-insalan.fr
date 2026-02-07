<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import { BracketType } from '@/models/bracket';
import { BestofType, MatchTypeEnum } from '@/models/match';
import type { EventTournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import { between, required } from '@/support/locales/errors.fr';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref;
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
const { validated_teams } = storeToRefs(useTournamentStore()).tourney_teams.value;

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

  await launchMatchs({ tournament: tournament.id, matchs: Array.from(selected_matchs.value) }, 'bracket');

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
  bo_type: BestofType.BO1,
});
const bracket_rules = computed(() => ({
  name: { required },
  team_count: { required, between: between(2, validated_teams.length) },
  bracket_type: { required },
  bo_type: { required },
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

const bracket_round_title = (depth: number, round_idx: number) => {
  if (round_idx < depth - 2) {
    return `${2 ** (depth - round_idx)}ᵉ de finale`;
  }
  if (round_idx === depth - 2) {
    return 'Quarts de finale';
  }
  if (round_idx === depth - 1) {
    return 'Demi-finales';
  }
  if (round_idx === depth) {
    return 'Finale';
  }

  return '';
};
</script>

<template>
  <div
    class="u-m-2 flex flex-wrap l-items-main-center l-gap-2 lg:m-8 lg:mb-2 lg:gap-16"
  >
    <button
      type="button"
      class="rounded bg-blue-800 u-p-1 text-xl u-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
      @click="open_modal('create_bracket')"
    >
      Créer un arbre
      <fa-awesome-icon
        icon="fa-solid fa-circle-plus"
      />
    </button>

    <button
      type="button"
      class="rounded bg-blue-800 u-p-1 u-bold transition duration-150 ease-in-out"
      :class="[has_matchs && selected_matchs.size > 0 ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
      :disabled="!has_matchs || selected_matchs.size === 0"
      @click="launch_selected_matchs"
    >
      Lancer les matchs séléctionnés
    </button>
  </div>

  <div
    v-for="bracket in tournament.brackets"
    :key="bracket.id"
    class="mb-5"
  >
    <h1 class="c-title">
      Arbre {{ bracket.name }}
      <fa-awesome-icon
        icon="fa-solid fa-trash-can"
        size="xs"
        class="ml-3 text-red-500 hover:cursor-pointer hover:text-red-700"
        title="Supprimer l'arbre"
        @click="open_delete_bracket_modal(bracket.id)"
      />
    </h1>

    <div
      v-if="bracket.bracket_type === BracketType.SINGLE"
      :key="bracket.id"
      class="u-mx-2 overflow-x-auto"
    >
      <div
        class="grid l-items-cross-center gap-x-10 gap-y-2"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="round_idx in bracket.depth + 1"
          :key="round_idx"
          class="u-text-center text-xl"
        >
          {{ bracket_round_title(bracket.depth, round_idx) }}
        </div>
        <div
          v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)"
          :key="round_idx"
          class="l-flex-column u-full-height justify-around l-gap-1"
        >
          <MatchCard
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
          class="bg-yellow-600 u-p-1"
        >
          <h1
            class="text-bold u-text-center text-2xl"
          >
            Vainqueur
          </h1>
          <p
            class="truncate text-wrap u-text-center text-xl"
          >
            {{ get_validated_team_by_id(bracket.winner)?.name }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="bracket.bracket_type === BracketType.DOUBLE"
      :key="bracket.id"
      class="u-mx-2 overflow-x-auto"
    >
      <h2
        class="u-ml-2 u-p-1 text-2xl"
      >
        Arbre principal
      </h2>
      <div
        class="grid u-full-height l-items-cross-center gap-x-10 gap-y-2"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="round_idx in 2 * bracket.depth + 1"
          :key="round_idx"
          class="u-text-center text-xl"
        >
          {{
            (round_idx === 1)
              ? bracket_round_title(bracket.depth, round_idx)
              : (round_idx % 2 === 0 && round_idx < 2 * bracket.depth)
                ? bracket_round_title(bracket.depth, (round_idx + 2) / 2)
                : (round_idx === 2 * bracket.depth)
                  ? 'Grande finale'
                  : ''
          }}
        </div>
        <div
          class="l-flex-column u-full-height justify-around l-gap-1"
        >
          <MatchCard
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
          class="l-flex-column u-full-height"
        >
          <div
            v-if="col_idx % 2"
            class="l-flex-column u-full-height justify-around l-gap-1"
          >
            <MatchCard
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
          class="bg-yellow-600 u-p-1"
        >
          <h1
            class="text-bold u-text-center text-2xl"
          >
            Vainqueur
          </h1>
          <p
            class="truncate text-wrap u-text-center text-xl"
          >
            {{ get_validated_team_by_id(bracket.winner)?.name }}
          </p>
        </div>
      </div>

      <h2
        class="u-ml-2 u-p-1 text-2xl"
      >
        Arbre de repêchage
      </h2>

      <div
        class="grid l-items-cross-center gap-x-10 gap-y-2"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="round_idx in 2 * bracket.depth + 1"
          :key="round_idx"
          class="u-text-center text-xl"
        >
          {{
            (round_idx !== 1 && round_idx < 2 * bracket.depth - 1)
              ? `Tour ${round_idx - 1}`
              : (round_idx === 2 * bracket.depth - 1)
                ? 'Finale'
                : ''
          }}
        </div>
        <div/>
        <div
          v-for="(games, round_idx) in get_looser_matchs(bracket.matchs)"
          :key="round_idx"
          class="l-flex-column u-full-height justify-around l-gap-1"
        >
          <MatchCard
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
        class="u-m-2 l-flex-column l-gap-2"
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
            class="u-ml-1 bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v$.name.$touch"
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
            class="u-ml-1 bg-inherit"
            @blur="v$.bracket_type.$touch"
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
            class="u-ml-1 bg-inherit"
            type="number"
            :class="{ error: context.invalid }"
            @blur="v$.team_count.$touch"
          />
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
            v-model="bracket_data.bo_type"
            name="bo_type"
            class="u-ml-1 bg-inherit"
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
        class="c-btn-bg-3"
        type="button"
        @click="modal_open = false;"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="create_bracket"
      >
        Créer l'arbre
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
        class="c-btn-bg-3"
        type="button"
        @click="modal_open = false;"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="delete_bracket"
      >
        Valider
      </button>
    </template>
  </Modal>
</template>
