<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
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
} from '@/support/locales/errors';

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
const { t } = useI18n();

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
  addNotification(t('components.tournament.admin.adminGroups.matchesCreated'), 'info');
};

const open_launch_round_modal = async () => {
  if (!has_matchs.value) {
    addNotification(t('common.noMatches'), 'info');
    return;
  }

  open_modal('launch_round');
};

const launch_round_matchs = async () => {
  const is_valid = await v_round$.value.$validate();

  if (!is_valid) return;

  await launchMatchs(groups.map((g) => ({ id: g.id, round: round.value })), 'groups');

  addNotification(t('components.tournament.admin.adminGroups.roundMatchesLaunched', { round: round.value }), 'info');

  modal_open.value = false;
};

const delete_groups = async () => {
  const res = await deleteGroups(groups.map((g) => g.id));

  if (res) addNotification(t('components.tournament.admin.adminGroups.groupsDeleted'), 'info');

  modal_open.value = false;
};

const delete_groups_matchs = async () => {
  const res = await deleteGroupMatchs(groups.map((g) => g.id));

  if (res) addNotification(t('components.tournament.admin.adminGroups.groupMatchesDeleted'), 'info');

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
      {{ t('components.tournament.admin.adminGroups.deleteGroups') }}
    </button>
    <button
      type="button"
      class="c-btn-bg-2"
      @click="open_modal(has_matchs ? 'delete_matchs' : 'create_matchs')"
    >
      {{ has_matchs ? t('common.delete') : t('common.create') }} {{ t('components.tournament.admin.adminGroups.matches') }}
    </button>
    <button
      type="button"
      class="c-btn-bg-2"
      :disabled="!has_matchs"
      @click="open_launch_round_modal"
    >
      {{ t('components.tournament.admin.adminGroups.launchRound') }}
    </button>
    <button
      type="button"
      class="c-btn-bg-2"
      @click="show_groups_matchs = true"
    >
      {{ t('components.tournament.admin.adminGroups.manageMatches') }}
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
      {{ t('components.tournament.admin.adminGroups.deleteGroupsTitle') }}
    </template>
    <template #body>
      {{ t('components.tournament.admin.adminGroups.deleteGroupsDescription') }}
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="modal_open = false;"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="delete_groups"
      >
        {{ t('common.validate') }}
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'create_matchs'"
    @close="modal_open = false;"
  >
    <template #title>
      {{ t('components.tournament.admin.adminGroups.createMatchesTitle') }}
    </template>
    <template #body>
      <p>
        {{ t('components.tournament.admin.adminGroups.createMatchesDescription') }}<br><br>
      </p>
      <form @submit.prevent="create_group_matchs">
        <FormField :validations="v_round$">
          <label for="bo_type">
            {{ t('components.tournament.admin.adminGroups.boType') }}
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
              {{ value === '0' ? t('components.tournament.admin.adminGroups.ranking') : t('common.bestOf', { value }) }}
            </option>
            <option
              v-for="value in Object.keys(BestofType).map(Number).filter((v) => Number.isInteger(v) && v > 1)"
              :key="value - 1"
              :value="value - 1"
            >
              {{ t('common.playAll', { value }) }}
            </option>
          </select>
        </FormField>
        <FormField :validations="v_round$">
          <label for="round_count">
            {{ t('components.tournament.admin.adminGroups.roundCount') }}
          </label>
          <input
            id="round_count"
            v-model="round_count"
            type="number"
            :aria-label="t('components.tournament.admin.adminGroups.roundCount')"
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
        {{ t('common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="create_group_matchs"
      >
        {{ t('common.validate') }}
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'delete_matchs'"
    @close="modal_open = false;"
  >
    <template #title>
      {{ t('components.tournament.admin.adminGroups.deleteMatchesTitle') }}
    </template>
    <template #body>
      {{ t('components.tournament.admin.adminGroups.deleteMatchesDescription') }}
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="modal_open = false;"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="delete_groups_matchs"
      >
        {{ t('common.validate') }}
      </button>
    </template>
  </Modal>

  <Modal
    v-if="modal_open && modal_type === 'launch_round'"
    @close="modal_open = false;"
  >
    <template #title>
      {{ t('components.tournament.admin.adminGroups.launchRoundMatches') }}
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
            {{ t('components.tournament.admin.adminGroups.roundNumber') }}
          </label>
          <input
            id="round"
            v-model="round"
            type="number"
            name="round"
            :aria-label="t('components.tournament.admin.adminGroups.roundNumber')"
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
        {{ t('common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="launch_round_matchs"
      >
        {{ t('components.tournament.admin.adminGroups.launchRound') }}
      </button>
    </template>
  </Modal>
</template>
