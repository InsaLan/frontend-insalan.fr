<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { computed, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import type { Group } from '@/models/group';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  required,
} from '@/support/locales/errors.fr';

import GroupDetail from '../GroupDetail.vue';

const { groups } = defineProps<{
  groups: Group[];
}>();

const show_groups_matchs = defineModel<boolean>();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const tournamentStore = useTournamentStore();
const {
  launchMatchs,
} = tournamentStore;

const has_matchs = computed(() => groups.some((g) => (g.matchs.length ?? 0) > 0));

const modal_open = ref(false);
const modal_type = ref('');
const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
};

const round_to_launch = ref(1);
const round_rule = computed(() => ({
  round_to_launch: {
    required,
    integer,
    between: between(1, Math.max(...groups.map((group) => group.round_count))),
  },
}));

const v_round$ = useVuelidate(round_rule, { round_to_launch });

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

  await launchMatchs(groups.map((g) => ({ id: g.id, round: round_to_launch.value })), 'groups');

  addNotification(`Les matchs du round ${round_to_launch.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

const selected_matchs = ref(new Set<number>());

const launch_selected_matchs = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  if (selected_matchs.value.size === 0) {
    addNotification('Aucun match sélectionné.', 'warn');
    return;
  }

  await launchMatchs(
    groups.map((g) => ({
      id: g.id,
      matchs: Array.from(selected_matchs.value).filter((m_id) => g.matchs.map((m) => m.id).includes(m_id)),
    })),
    'groups',
  );

  selected_matchs.value.clear();

  addNotification('Les matchs ont bien été lancés.', 'info');
};
</script>

<template>
  <div
    class="l-flex-row l-wrap l-main-center l-gap-2"
  >
    <button
      type="button"
      class="c-btn-bg-2"
      @click="show_groups_matchs = false"
    >
      <fa-awesome-icon
        icon="fa-chevron-left"
        class="c-inline-icon u-ml-0"
      />
      Gérer les poules
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
      :disabled="!has_matchs || selected_matchs.size === 0 "
      @click="launch_selected_matchs"
    >
      Lancer les matchs sélectionnés
    </button>
  </div>

  <div
    class="l-overflow-auto l-flex-column l-gap-2 u-full-width"
  >
    <GroupDetail
      v-for="group in groups"
      :key="group.id"
      v-model="selected_matchs"
      :group="group"
      :admin="true"
    />
  </div>

  <Modal v-if="modal_open && modal_type === 'launch_round'">
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
</template>
