<script setup lang="ts">
import { computed, ref } from 'vue';
import Modal from '@/components/Modal.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import type { Bracket } from '@/models/bracket';
import { BracketType } from '@/models/bracket';
import { MatchTypeEnum } from '@/models/match';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

const { bracket, admin } = defineProps<{
  bracket: Bracket;
  admin: boolean;
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
  <div class="l-flex-column l-gap-1">
    <h2 class="u-text-center">
      {{ bracket.name }}
      <button
        v-if="admin"
        type="button"
        title="Supprimer l'arbre"
        @click="open_delete_bracket_modal(bracket.id)"
      >
        <fa-awesome-icon
          icon="fa-trash-can"
          class="c-image-btn u-color-error-1 c-inline-icon u-mr-0"
        />
      </button>
    </h2>

    <div
      v-if="admin"
      class="l-flex-row l-main-center l-gap-2 u-full-width"
    >
      <button
        type="button"
        class="c-btn-bg-2"
        :disabled="!has_matchs || selected_matchs.size === 0"
        @click="launch_selected_matchs"
      >
        Lancer les matchs sélectionnés
      </button>
    </div>

    <div
      v-if="bracket.bracket_type === BracketType.SINGLE"
      :key="bracket.id"
      class="l-overflow-auto u-p-1"
    >
      <div
        class="l-grid-arbitrary l-cross-center l-gap-1"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="round_idx in bracket.depth + 1"
          :key="round_idx"
          class="u-text-center u-big-text"
        >
          {{ bracket_round_title(bracket.depth, round_idx) }}
        </div>
        <div
          v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)"
          :key="round_idx"
          class="l-flex-column u-full-height justify-evenly l-gap-1"
        >
          <MatchCard
            v-for="game in games"
            :key="game.id"
            v-model="selected_matchs"
            class="not-too-smol-card"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :editable="admin"
            :selectable="admin"
          />
        </div>
        <div
          v-if="bracket.winner !== null"
          class="u-text-center u-big-text u-p-2"
        >
          <strong>
            <fa-awesome-icon
              icon="fa-trophy"
              class="c-inline-icon u-ml-0"
            />
            Vainqueur·euse
          </strong>
          <br>
          {{ get_validated_team_by_id(bracket.winner)?.name }}
        </div>
      </div>
    </div>

    <div
      v-if="bracket.bracket_type === BracketType.DOUBLE"
      :key="bracket.id"
      class="l-overflow-auto u-p-1"
    >
      <h2 class="u-p-2">
        Arbre principal
      </h2>
      <div
        class="l-grid-arbitrary u-full-height l-cross-center l-gap-1"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="round_idx in 2 * bracket.depth + 1"
          :key="round_idx"
          class="u-text-center u-big-text"
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
          class="l-flex-column u-full-height justify-evenly l-gap-1"
        >
          <MatchCard
            v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth)"
            :key="game.id"
            v-model="selected_matchs"
            class="not-too-smol-card"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :editable="admin"
            :selectable="admin"
          />
        </div>
        <div
          v-for="col_idx in get_bracket_cols_count(bracket) - 2"
          :key="col_idx"
          class="l-flex-column u-full-height justify-evenly l-gap-1"
        >
          <template v-if="col_idx % 2">
            <MatchCard
              v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth - (col_idx - 1) / 2 - 1)"
              :key="game.id"
              v-model="selected_matchs"
              class="not-too-smol-card"
              :match="game"
              :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
              :editable="admin"
              :selectable="admin"
            />
          </template>
        </div>
        <div
          v-if="bracket.winner !== null"
          class="u-text-center u-big-text u-p-2"
        >
          <strong>
            <fa-awesome-icon
              icon="fa-trophy"
              class="c-inline-icon u-ml-0"
            />
            Vainqueur·euse
          </strong>
          <br>
          {{ get_validated_team_by_id(bracket.winner)?.name }}
        </div>
      </div>

      <h2 class="u-p-2">
        Arbre de repêchage
      </h2>

      <div
        class="l-grid-arbitrary l-cross-center l-gap-1"
        :style="get_col_style(bracket)"
      >
        <div
          v-for="round_idx in 2 * bracket.depth + 1"
          :key="round_idx"
          class="u-text-center u-big-text"
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
          class="l-flex-column u-full-height justify-evenly l-gap-1"
        >
          <MatchCard
            v-for="game in games"
            :key="game.id"
            v-model="selected_matchs"
            class="not-too-smol-card"
            :match="game"
            :match-type="{ type: MatchTypeEnum.BRACKET, id: bracket.id }"
            :editable="admin"
            :selectable="admin"
          />
        </div>
        <div/>
      </div>
    </div>
  </div>

  <Modal
    v-if="modal_open && modal_type === 'delete_bracket'"
    @close="modal_open = false;"
  >
    <template #title>
      Supprimer l'arbre
    </template>
    <template #body>
      L'arbre va être supprimé ainsi que les matchs qui lui sont liés.
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

<style scoped>
.justify-evenly {
  justify-content: space-evenly;
}

.not-too-smol-card {
  min-width: 14rem;
}
</style>
