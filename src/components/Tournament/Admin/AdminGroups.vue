<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import GroupTable from '@/components/Tournament/GroupTable.vue';
import type { Group } from '@/models/group';
import { BestofType } from '@/models/match';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  required,
} from '@/support/locales/errors.fr';

const { groups } = defineProps<{
  groups: Group[];
}>();

const show_groups_matchs = defineModel<boolean>();

const tournamentStore = useTournamentStore();
const {
  getTournamentTeams,
  createGroupMatchs,
  deleteGroups,
  deleteGroupMatchs,
  launchMatchs,
} = tournamentStore;
getTournamentTeams();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const has_matchs = computed(() => groups.some((g) => g.matchs.length > 0));

const modal_open = ref(false);
const modal_type = ref('');

const round = ref(1);
const round_rule = computed(() => ({
  round: { required, integer, between: between(1, Math.max(...groups.map((group) => group.round_count))) },
}));

const v_round$ = useVuelidate(round_rule, { round });

const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
};

const bo_type = ref(BestofType.BO1);
const play_all = ref(false);
const round_count = ref(Math.max(...groups.map((g) => g.round_count)));

const edit_bo_type = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (value > 0 && value % 2 === 0) {
    bo_type.value = value + 1;
    play_all.value = true;
  } else {
    bo_type.value = value;
    play_all.value = false;
  }
};

const create_group_matchs = async () => {
  await createGroupMatchs(groups.map((group) => group.id), bo_type.value, play_all.value, round_count.value);

  modal_open.value = false;
  addNotification('Les matchs ont bien été créés.', 'info');
};

const open_launch_round_modal = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  open_modal('launch_round');
};

const launch_round_matchs = async () => {
  const is_valid = await v_round$.value.$validate();

  if (!is_valid) return;

  await launchMatchs(groups.map((g) => ({ id: g.id, round: round.value })), 'groups');

  addNotification(`Les matchs du round ${round.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

const delete_groups = async () => {
  const res = await deleteGroups(groups.map((g) => g.id));

  if (res) addNotification('Les poules ont bien été supprimées', 'info');

  modal_open.value = false;
};

const delete_groups_matchs = async () => {
  const res = await deleteGroupMatchs(groups.map((g) => g.id));

  if (res) addNotification('Les matchs de poules ont bien été supprimées', 'info');

  modal_open.value = false;
};
</script>

<template>
  <div
    class="l-flex-row l-wrap l-main-center l-cross-center l-gap-2"
  >
    <button
      type="button"
      class="c-btn-bg-2"
      @click="open_modal('delete_groups')"
    >
      Supprimer les poules
    </button>
    <button
      type="button"
      class="c-btn-bg-2"
      @click="open_modal(has_matchs ? 'delete_matchs' : 'create_matchs')"
    >
      {{ has_matchs ? 'Supprimer' : 'Créer' }} les matchs
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
      @click="show_groups_matchs = true"
    >
      Gérer les matchs
      <fa-awesome-icon
        icon="fa-chevron-right"
        class="c-inline-icon u-mr-0"
      />
    </button>
  </div>

  <div
    class="l-flex-row l-wrap l-main-center l-gap-2"
  >
    <GroupTable
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :editable="true"
    />
  </div>

  <Modal
    v-if="modal_open && modal_type === 'delete_groups'"
    @close="modal_open = false;"
  >
    <template #title>
      Suppression des poules
    </template>
    <template #body>
      Les poules vont être supprimées ainsi que les matchs qui leurs sont liés.
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
        @click="delete_groups"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'create_matchs'"
    @close="modal_open = false;"
  >
    <template #title>
      Créer les matchs
    </template>
    <template #body>
      <p>
        Les matchs des poules vont être créés.<br><br>
      </p>
      <form @submit.prevent="create_group_matchs">
        <FormField :validations="v_round$">
          <label for="bo_type">
            Type de BO
          </label>
          <select
            id="bo_type"
            name="bo_type"
            class="bg-theme-bg"
            :value="bo_type"
            @change="edit_bo_type"
          >
            <option
              v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
              :key="value"
              :value="value"
            >
              {{ value === '0' ? 'Classement' : `BO ${value}` }}
            </option>
            <option
              v-for="value in Object.keys(BestofType).map(Number).filter((v) => Number.isInteger(v) && v > 1)"
              :key="value - 1"
              :value="value - 1"
            >
              {{ `PA ${value}` }}
            </option>
          </select>
        </FormField>
        <FormField :validations="v_round$">
          <label for="round_count">
            Nombre de tours
          </label>
          <input
            id="round_count"
            v-model="round_count"
            type="number"
            aria-label="Number of rounds"
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
        @click="create_group_matchs"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'delete_matchs'"
    @close="modal_open = false;"
  >
    <template #title>
      Supprimer les matchs
    </template>
    <template #body>
      Les matchs des poules vont être supprimés si aucun match n'est en cours ou terminé.
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
        @click="delete_groups_matchs"
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
          :validations="v_round$.round"
        >
          <label for="round">
            Numéro du tour
          </label>
          <input
            id="round"
            v-model="round"
            type="number"
            name="round"
            aria-label="Round number"
            @blur="v_round$.round.$touch"
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
</template>
