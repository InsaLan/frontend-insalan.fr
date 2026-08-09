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
  admin: boolean;
}>();

const { addNotification } = useNotificationStore();

const {
  launchMatchs,
  deleteSwiss,
  swissFillRound,
} = useTournamentStore();

const roundCount = computed(() => {
  if (swiss.min_score !== null) {
    return 2 * swiss.min_score - 1;
  }
  if (swiss.round_count !== null) {
    return swiss.round_count;
  }

  return 1;
});

const qualifying_round_idx = computed(() => {
  if (swiss.min_score !== null) {
    return swiss.min_score;
  }
  if (swiss.round_count != null) {
    return swiss.round_count;
  }

  return 1;
});

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
    between: between(1, roundCount.value),
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
    between: between(2, roundCount.value),
  },
}));
const v_create_round$ = useVuelidate(create_round_rules, { round_to_create });

const swiss_fill_round = async () => {
  const is_valid = await v_create_round$.value.$validate();

  if (!is_valid) return;

  await swissFillRound(swiss.id, round_to_create.value);

  modal_open.value = false;
  addNotification(`Les matchs du tour ${round_to_create.value} ont bien été générés.`, 'info');
};

</script>

<template>
  <div class="l-flex-column l-gap-1">
    <h2 class="u-text-center">
      {{ swiss.name }}
      <button
        v-if="admin"
        type="button"
        title="Supprimer la ronde suisse"
        @click="open_modal('delete_swiss')"
      >
        <fa-awesome-icon
          icon="fa-trash-can"
          class="c-image-btn u-color-error-1 c-inline-icon u-mr-0"
        />
      </button>
    </h2>

    <div
      v-if="admin"
      class="l-flex-row l-main-center l-gap-2"
    >
      <button
        type="button"
        class="c-btn-bg-2"
        @click="open_fill_round_modal"
      >
        Générer un tour
      </button>
      <button
        type="button"
        class="c-btn-bg-2"
        :disabled="!has_matchs"
        @click="open_launch_round_modal"
      >
        Lancer un tour
      </button>
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
      class="u-p-1 l-grid-arbitrary l-gap-2 l-overflow-auto"
      :style="{ 'grid-template-columns': `repeat(${roundCount}, minmax(16rem,1fr))` }"
    >
      <div
        v-for="round_idx in roundCount"
        :key="round_idx"
        class="u-text-center u-big-text"
      >
        Tour {{ round_idx }}
      </div>
      <div
        v-for="(round_matchs, round_idx) in groupBy(swiss.matchs, 'round_number')"
        :key="round_idx"
        class="l-flex-column l-gap-2"
      >
        <div
          v-for="(matchs, score_group) in groupBy(round_matchs, 'score_group')"
          :key="score_group"
          class="c-frame u-p-0 u-full-width"
        >
          <div
            class="u-text-center"
          >
            <div
              v-if="Number(round_idx) <= qualifying_round_idx"
            >
              {{ Number(round_idx) - 1 - Number(score_group) }} - {{ score_group }}
            </div>
            <div v-else>
              {{ qualifying_round_idx - 1 - Number(score_group) }} -
              {{ Number(round_idx) - qualifying_round_idx + Number(score_group) }}
            </div>
          </div>

          <div
            class="l-flex-column l-cross-center l-gap-1 u-p-1"
          >
            <div
              v-for="match in matchs"
              :key="match.id"
              class="u-full-width"
            >
              <MatchCard
                v-model="selected_matchs"
                :match="match"
                :match-type="{ type: MatchTypeEnum.SWISS, id: match.swiss }"
                :editable="admin"
                :selectable="admin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-if="modal_open && modal_type === 'delete_swiss'"
    @close="modal_open = false;"
  >
    <template #title>
      Supprimer la ronde suisse
    </template>
    <template #body>
      La ronde suisse va être supprimée ainsi que les matchs qui lui sont liés.
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
        @click="delete_swiss"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'launch_round'"
    @close="modal_open = false;"
  >
    <template #title>
      Lancer les matchs d'un tour
    </template>
    <template #body>
      <form
        id="create_groups_form"
        @submit.prevent="launch_round_matchs"
      >
        <FormField
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
            @blur="v_round$.round_to_launch.$touch"
          >
        </FormField>
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
        @click="launch_round_matchs"
      >
        Lancer le tour
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'create_round'"
    @close="modal_open = false;"
  >
    <template #title>
      Générer les matchs d'un tour
    </template>
    <template #body>
      <form
        id="create_groups_form"
        @submit.prevent="swiss_fill_round"
      >
        <p>
          Les résultats du tour précédent vont être utilisés pour produire les nouveaux matchs.
          <br>
          Les rencontres au sein d'un même groupe de score sont déterminées aléatoirement.
        </p>
        <FormField
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
            @blur="v_create_round$.round_to_create.$touch"
          >
        </FormField>
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
        @click="swiss_fill_round"
      >
        Générer le tour
      </button>
    </template>
  </Modal>
</template>
