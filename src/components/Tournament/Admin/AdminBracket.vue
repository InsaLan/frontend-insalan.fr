<script setup lang="ts">
import { computed, ref } from 'vue';
import Modal from '@/components/Modal.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import type { Bracket } from '@/models/bracket';
import { BracketType } from '@/models/bracket';
import { MatchTypeEnum } from '@/models/match';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

const { bracket } = defineProps<{
  bracket: Bracket;
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
  deleteBracket,
} = useTournamentStore();

const has_matchs = computed(() => bracket.matchs.length > 0);

const selected_matchs = ref(new Set<number>());

const launch_selected_matchs = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  if (selected_matchs.value.size === 0) {
    addNotification('Aucun match sélectionné', 'info');
  }

  await launchMatchs([{ id: bracket.id, matchs: Array.from(selected_matchs.value) }], 'brackets');

  selected_matchs.value.clear();

  addNotification('Les matchs ont bien été lancés.', 'info');
};

const modal_open = ref(false);
const modal_type = ref('');

const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
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
  <h1 class="title">
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
    class="m-4 flex justify-center gap-4 lg:mx-8"
  >
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
    v-if="bracket.bracket_type === BracketType.SINGLE"
    :key="bracket.id"
    class="mx-4 overflow-x-auto"
  >
    <div
      class="grid items-center gap-x-10 gap-y-2"
      :style="get_col_style(bracket)"
    >
      <div
        v-for="round_idx in bracket.depth + 1"
        :key="round_idx"
        class="text-center text-xl"
      >
        {{ bracket_round_title(bracket.depth, round_idx) }}
      </div>
      <div
        v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)"
        :key="round_idx"
        class="flex h-full flex-col justify-around gap-2"
      >
        <MatchCard
          v-for="game in games"
          :key="game.id"
          v-model="selected_matchs"
          :match="game"
          :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
          :editable="true"
          :selectable="true"
        />
      </div>
      <div
        v-if="bracket.winner !== null"
        class="bg-yellow-600 p-2"
      >
        <h1
          class="text-bold text-center text-2xl"
        >
          Vainqueur
        </h1>
        <p
          class="truncate text-wrap text-center text-xl"
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
    <h2
      class="ml-4 p-2 text-2xl"
    >
      Arbre principal
    </h2>
    <div
      class="grid h-full items-center gap-x-10 gap-y-2"
      :style="get_col_style(bracket)"
    >
      <div
        v-for="round_idx in 2 * bracket.depth + 1"
        :key="round_idx"
        class="text-center text-xl"
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
        class="flex h-full flex-col justify-around gap-2"
      >
        <MatchCard
          v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth)"
          :key="game.id"
          v-model="selected_matchs"
          :match="game"
          :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
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
          class="flex h-full flex-col justify-around gap-2"
        >
          <MatchCard
            v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth - (col_idx - 1) / 2 - 1)"
            :key="game.id"
            v-model="selected_matchs"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :editable="true"
            :selectable="true"
          />
        </div>
      </div>
      <div
        v-if="bracket.winner !== null"
        class="bg-yellow-600 p-2"
      >
        <h1
          class="text-bold text-center text-2xl"
        >
          Vainqueur
        </h1>
        <p
          class="truncate text-wrap text-center text-xl"
        >
          {{ get_validated_team_by_id(bracket.winner)?.name }}
        </p>
      </div>
    </div>

    <h2
      class="ml-4 p-2 text-2xl"
    >
      Arbre de repêchage
    </h2>

    <div
      class="grid items-center gap-x-10 gap-y-2"
      :style="get_col_style(bracket)"
    >
      <div
        v-for="round_idx in 2 * bracket.depth + 1"
        :key="round_idx"
        class="text-center text-xl"
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
        class="flex h-full flex-col justify-around gap-2"
      >
        <MatchCard
          v-for="game in games"
          :key="game.id"
          v-model="selected_matchs"
          :match="game"
          :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
          :editable="true"
          :selectable="true"
        />
      </div>
      <div/>
    </div>
  </div>

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
</template>
