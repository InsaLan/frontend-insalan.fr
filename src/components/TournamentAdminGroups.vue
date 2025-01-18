<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import {
  between,
  integer,
  minLength,
  minValue,
  required,
} from '@vuelidate/validators';
import { computed, reactive, ref } from 'vue';
import type { TournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

import AdminGroupTable from './AdminGroupTable.vue';
import FormField from './FormField.vue';
import Modal from './Modal.vue';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const {
  getTournamentTeams,
  createGroups,
  createGroupMatchs,
  deleteGroups,
  deleteGroupMatchs,
} = tournamentStore;
getTournamentTeams();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const has_groups = computed(() => (tournament.groups.length ?? 0) > 0);
const has_matchs = computed(() => has_groups.value && (tournament.groups[0].matchs.length ?? 0) > 0);

const modal_open = ref(false);
const modal_type = ref('');
const group_data = reactive({
  tournament: tournament.id ?? 0,
  count: 0,
  team_per_group: 0,
  names: [''],
  use_seeding: true,
});

const update_names = (event: Event) => {
  const names = (event.target?.value as string).split(',');
  names.forEach((el) => el.trim());
  group_data.names = names;
};

const rules_group = computed(() => ({
  tournament: {},
  count: { required, integer, between: between(1, (tournament.teams.length ?? 0) / 2) },
  team_per_group: { required, integer, minValue: minValue(2) },
  names: { minLength: minLength(group_data.count) },
  use_seeding: { required },
}));

const v$ = useVuelidate(rules_group, group_data);

const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
};

const create_groups = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  await createGroups(group_data);

  modal_open.value = false;
  addNotification('Les poules ont bien été créées.', 'info');
};

const create_delete_matchs = async () => {
  if (has_matchs.value) {
    open_modal('delete_matchs');
    return;
  }

  if (!has_groups.value) {
    addNotification('Il n\'existent pas de poules', 'info');
    return;
  }

  await createGroupMatchs(tournament.id, tournament.groups.map((group) => group.id));

  addNotification('Les matchs ont bien été créés.', 'info');
};

const launch_round = async () => {};

const delete_groups = async () => {
  const res = await deleteGroups(tournament.id);

  if (res) addNotification('Les poules ont bien été supprimées', 'info');

  modal_open.value = false;
};

const delete_group_matchs = async () => {
  const res = await deleteGroupMatchs(tournament.id);

  if (res) addNotification('Les matchs de poules ont bien été supprimées', 'info');

  modal_open.value = false;
};
</script>

<template>
  <div
    class="m-8 flex justify-center gap-16"
  >
    <div
      class="flex flex-col gap-8 sm:flex-row"
    >
      <button
        type="button"
        class="center rounded p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        :class="[has_groups ? 'bg-red-500' : 'bg-blue-800']"
        @click="open_modal(has_groups ? 'delete_groups' : 'create_groups')"
      >
        {{ has_groups ? 'Supprimer' : 'Générer' }} les poules
      </button>

      <button
        type="button"
        class="center rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
        :class="[has_matchs ? 'bg-red-500' : 'bg-blue-800', has_groups ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
        :disabled="!has_groups"
        @click="create_delete_matchs"
      >
        {{ has_matchs ? 'Supprimer' : 'Créer' }} les matchs
      </button>
    </div>
    <div
      class="flex flex-col gap-8 sm:flex-row"
    >
      <button
        type="button"
        class="center rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        @click="launch_round"
      >
        Lancer un round
      </button>

      <router-link
        :to="{ name: 'tournament_admin_groups-matchs' }"
        class="rounded bg-blue-800 p-2 text-center font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
      >
        Gérer les matchs
      </router-link>
    </div>
  </div>

  <div class="mb-10 flex flex-1 flex-wrap justify-center gap-20">
    <div
      v-for="(group, idx) in tournament.groups"
      :key="group.id"
      class="m-2 lg:m-0 lg:w-2/5"
    >
      <AdminGroupTable v-model="(tournament as TournamentDeref).groups[idx]"/>
    </div>
  </div>

  <Modal v-if="modal_open && modal_type === 'create_groups'">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Création des Poules
      </h3>
    </template>
    <template #body>
      <form
        id="create_groups_form"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="create_groups"
      >
        <FormField
          v-slot="context"
          :validations="v$.count"
        >
          <label for="group_count">
            Nombre de poules
          </label>
          <input
            id="group_count"
            v-model="group_data.count"
            :class="{ error: context.invalid }"
            aria-label="Group count"
            class="ml-2 bg-inherit"
            type="number"
          >
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.team_per_group"
        >
          <label for="team_per_group">
            Nombre d'équipes par poules
          </label>
          <input
            id="team_per_group"
            v-model="group_data.team_per_group"
            :class="{ error: context.invalid }"
            aria-label="Team per group"
            class="ml-2 bg-inherit"
            type="number"
          >
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.names"
        >
          <label for="names">
            Noms des poules (Liste de noms séparées par des virgules)
          </label>
          <br>
          <input
            id="names"
            :class="{ error: context.invalid }"
            aria-label="Group names"
            class="ml-2 bg-inherit"
            type="text"
            :value="group_data.names.join(',')"
            @input="update_names"
          >
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
            v-model="group_data.use_seeding"
            :class="{ error: context.invalid }"
            aria-label="Use team seeding"
            class="ml-2 bg-inherit"
            type="checkbox"
          >
        </FormField>
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="create_groups"
      >
        Créer les poules
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

  <Modal v-if="modal_open && modal_type === 'delete_matchs'">
    <template #title>
      <h3>
        Supprimer les matchs
      </h3>
    </template>
    <template #body>
      Les matchs des poules vont êtres supprimés si aucun n'est en cours ou terminés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_group_matchs"
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
