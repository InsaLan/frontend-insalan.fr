<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import GroupTable from '@/components/Tournament/GroupTable.vue';
import { BestofType } from '@/models/match';
import type { EventTournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  minLength,
  required,
} from '@/support/locales/errors.fr';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const {
  getTournamentTeams,
  createGroups,
  createGroupMatchs,
  deleteGroups,
  deleteGroupMatchs,
  launchMatchs,
} = tournamentStore;
getTournamentTeams();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const has_groups = computed(() => (tournament.groups.length ?? 0) > 0);
const has_matchs = computed(() => has_groups.value && tournament.groups.some((g) => g.matchs.length > 0));

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
  const names = (event.target as HTMLInputElement)?.value.split(',');
  names.forEach((el) => el.trim());
  group_data.names = names;
};

const rules_group = computed(() => ({
  tournament: {},
  count: {
    required,
    integer,
    between: between(1, (tournament.teams.length ?? 0) / 2),
  },
  team_per_group: {
    required,
    integer,
    between: between(2, tournament.teams.length),
  },
  names: { minLength: minLength(group_data.count) },
  use_seeding: { required },
}));

const v$ = useVuelidate(rules_group, group_data);

const round = ref(1);
const round_rule = computed(() => ({
  round: { required, integer, between: between(1, Math.max(...tournament.groups.map((group) => group.round_count))) },
}));

const v_round$ = useVuelidate(round_rule, { round });

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

const bo_type = ref(BestofType.BO1);
const create_group_matchs = async () => {
  if (!has_groups.value) {
    addNotification('Il n\'existe pas de poules', 'info');
    return;
  }

  await createGroupMatchs(tournament.id, tournament.groups.map((group) => group.id), bo_type.value);

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

  await launchMatchs({ tournament: tournament.id, round: round.value }, 'group');

  addNotification(`Les matchs du round ${round.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

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
    class="m-8 flex gap-16"
  >
    <div
      class="flex w-1/2 flex-col justify-end gap-8 sm:flex-row"
    >
      <button
        type="button"
        class="rounded p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        :class="[has_groups ? 'bg-red-500' : 'bg-blue-800']"
        @click="open_modal(has_groups ? 'delete_groups' : 'create_groups')"
      >
        {{ has_groups ? 'Supprimer' : 'Générer' }} les poules
      </button>

      <button
        type="button"
        class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
        :class="[has_matchs ? 'bg-red-500' : 'bg-blue-800', has_groups ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
        :disabled="!has_groups"
        @click="open_modal(has_matchs ? 'delete_matchs' : 'create_matchs')"
      >
        {{ has_matchs ? 'Supprimer' : 'Créer' }} les matchs
      </button>
    </div>
    <div
      class="flex w-1/2 flex-col gap-8 sm:flex-row"
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

      <router-link
        :to="{ name: has_matchs ? 'tournament_admin_groups-matchs' : '' }"
        class="content-center rounded bg-blue-800 p-2 text-center font-bold transition duration-150 ease-in-out "
        :class="[has_matchs ? 'hover:ring hover:ring-pink-500' : '-z-10 opacity-60']"
      >
        Gérer les matchs
        <fa-awesome-icon
          icon="fa-solid fa-arrow-right"
        />
      </router-link>
    </div>
  </div>

  <div
    class="m-4 mt-0 flex flex-wrap justify-center gap-6 md:m-6 md:mt-0 lg:m-8 lg:mt-0 lg:gap-8 2xl:m-9 2xl:mt-0 2xl:gap-10"
  >
    <GroupTable
      v-for="group in tournament.groups"
      :key="group.id"
      :group="group"
      :editable="true"
      class="w-[27rem] shrink"
    />
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
          class="flex flex-col"
        >
          <div>
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
              @blur="v$.count.$touch"
            >
          </div>
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.team_per_group"
          class="flex flex-col"
        >
          <div>
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
              @blur="v$.team_per_group.$touch"
            >
          </div>
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.names"
          class="flex flex-col"
        >
          <label for="names">
            Noms des poules (Liste de noms séparées par des virgules)
          </label>
          <input
            id="names"
            :class="{ error: context.invalid }"
            aria-label="Group names"
            class="ml-2 bg-inherit"
            type="text"
            :value="group_data.names.join(',')"
            @input="update_names"
            @blur="v$.names.$touch"
          >
        </FormField>
        <FormField
          v-slot="context"
          :validations="v$.use_seeding"
          class="flex flex-col"
        >
          <div>
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
              @blur="v$.use_seeding.$touch"
            >
          </div>
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
          class="bg-inherit"
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
