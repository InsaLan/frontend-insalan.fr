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
const create_group_matchs = async () => {
  await createGroupMatchs(groups.map((group) => group.id), bo_type.value);

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
    class="m-4 flex gap-16"
  >
    <div
      class="flex w-1/2 flex-col justify-end gap-8 md:flex-row"
    >
      <button
        type="button"
        class="rounded bg-red-500 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        @click="open_modal('delete_groups')"
      >
        Supprimer les poules
      </button>

      <button
        type="button"
        class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        :class="[has_matchs ? 'bg-red-500' : 'bg-blue-800']"
        @click="open_modal(has_matchs ? 'delete_matchs' : 'create_matchs')"
      >
        {{ has_matchs ? 'Supprimer' : 'Créer' }} les matchs
      </button>
    </div>
    <div
      class="flex w-1/2 flex-col gap-8 md:flex-row"
    >
      <button
        type="button"
        class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
        :class="[!has_matchs ? '-z-10 opacity-60' : 'hover:ring hover:ring-pink-500']"
        :disabled="!has_matchs"
        @click="open_launch_round_modal"
      >
        Lancer un tour
      </button>

      <button
        type="button"
        class="content-center rounded bg-blue-800 p-2 text-center font-bold transition duration-150 ease-in-out "
        :class="[has_matchs ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
        @click="show_groups_matchs = true"
      >
        Gérer les matchs
        <fa-awesome-icon
          icon="fa-solid fa-arrow-right"
        />
      </button>
    </div>
  </div>

  <div
    class="m-4 mt-0 flex flex-wrap justify-center gap-6 md:m-6 md:mt-0 lg:m-8 lg:mt-0 lg:gap-8 2xl:m-9 2xl:mt-0 2xl:gap-10"
  >
    <GroupTable
      v-for="group in groups"
      :key="group.id"
      :group="group"
      :editable="true"
      class="w-[27rem] shrink"
    />
  </div>

  <Modal v-if="modal_open && modal_type === 'delete_groups'">
    <template #title>
      <h3>
        Supprimer les poules
      </h3>
    </template>
    <template #body>
      Les poules vont être supprimées ainsi que les matchs qui leurs sont liés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_groups"
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

  <Modal v-if="modal_open && modal_type === 'create_matchs'">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3>
        Créer les matchs
      </h3>
    </template>
    <template #body>
      Les matchs des poules vont être créés.

      <div
        class="flex items-center gap-4 pt-2"
      >
        <label for="bo_type">
          Type de BO
        </label>
        <select
          id="bo_type"
          v-model="bo_type"
          name="bo_type"
          class="bg-theme-bg"
        >
          <option
            v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
            :key="value"
            :value="value"
          >
            {{ value === '0' ? 'Classement' : `BO ${value}` }}
          </option>
        </select>
      </div>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="create_group_matchs"
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

  <Modal v-if="modal_open && modal_type === 'delete_matchs'">
    <template #title>
      <h3>
        Supprimer les matchs
      </h3>
    </template>
    <template #body>
      Les matchs des poules vont êtres supprimés si aucun match n'est en cours ou terminés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_groups_matchs"
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
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v_round$.round.$touch"
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
