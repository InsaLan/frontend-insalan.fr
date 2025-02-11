<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { integer, minValue, required } from '@vuelidate/validators';
import {
  computed,
  reactive,
  type Ref,
  ref,
} from 'vue';
import type { Group } from '@/models/group';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

import Modal from './Modal.vue';

const group = defineModel<Group>() as Ref<Group>;

const TournamentStore = useTournamentStore();
const { get_validated_team_by_id, editGroup, deleteGroup } = TournamentStore;

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const edit_name = ref(false);
const data_name = reactive({ name: group.value.name });
const rules_name = computed(() => ({
  name: { required },
}));

const v$ = useVuelidate(rules_name, data_name);

const save_group_name = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  await editGroup(group.value.id, { name: data_name.name });

  group.value.name = data_name.name;

  edit_name.value = false;

  addNotification('Nom de la poule modifiée', 'info');
};

const data_tiebreak = reactive(group.value.teams.reduce((res, item) => {
  if (Object.keys(group.value.tiebreak_scores).includes(item.toString())) {
    res[item] = group.value.tiebreak_scores[item];
  } else {
    res[item] = 0;
  }
  return res;
}, {} as Record<string, number>));
const rules_tiebreak = computed(() => group.value.teams.reduce((res, item) => {
  res[item] = {
    integer,
    minValue: minValue(0),
  };
  return res;
}, {} as Record<number, { integer: ValidationRule; minValue: ValidationRule }>));
const v$_tiebreak = useVuelidate(rules_tiebreak, data_tiebreak);

const save_tiebreak_scores = async () => {
  const is_valid = await v$_tiebreak.value.$validate();

  if (!is_valid) return;

  const modified_tiebreak = Object.fromEntries(
    Object.entries(data_tiebreak).filter(
      ([k, v]) => v !== (Object.keys(group.value.tiebreak_scores).includes(k) ? group.value.tiebreak_scores[k] : 0),
    ),
  );
  if (Object.keys(modified_tiebreak).length === 0) {
    addNotification('Pas de modifications', 'info');
    return;
  }

  await editGroup(group.value.id, { tiebreak_scores: modified_tiebreak });

  Object.assign(group.value.tiebreak_scores, modified_tiebreak);

  addNotification('Scores de tiebreak modifiés', 'info');
};

const modal_open = ref(false);

const delete_group = async (confirm: boolean) => {
  if (!confirm) {
    modal_open.value = true;
    return;
  }

  const res = await deleteGroup(group.value.id);

  if (res) addNotification('La poule à bien été supprimée', 'info');

  modal_open.value = false;
};
</script>

<template>
  <table :key="group.id" border="1" class="text-bold w-full table-fixed overflow-auto text-3xl">
    <thead class="w-full">
      <tr class="h-0 w-auto">
        <th class="w-2/3 bg-slate-400 text-center text-black md:w-3/4"/>
        <th class="w-1/3 bg-slate-400 text-center text-black md:w-1/4"/>
      </tr>
      <tr>
        <th colspan="2" class="bg-slate-400 p-3 text-black">
          <div v-if="!edit_name">
            {{ group.name }}
            <fa-awesome-icon
              class="hover:cursor-pointer"
              icon="fa-solid fa-pencil"
              size="2xs"
              title="Edit group name"
              @click="edit_name = true"
            />
            <fa-awesome-icon
              class="mx-2 text-red-500 hover:cursor-pointer"
              icon="fa-solid fa-trash-can"
              size="2xs"
              title="Delete Group"
              @click="delete_group(false)"
            />
          </div>
          <div v-else>
            <input
              id="group_name"
              v-model="data_name.name"
              class="bg-inherit p-0 text-center text-3xl"
              type="text"
              name="group_name"
              :size="data_name.name.length"
            >
            <fa-awesome-icon
              class="px-2 text-red-600 hover:cursor-pointer"
              icon="fa-solid fa-xmark"
              size="lg"
              title="Cancel"
              @click="edit_name = false"
            />
            <fa-awesome-icon
              class="hover:cursor-pointer"
              icon="fa-solid fa-save"
              size="lg"
              title="Save group name"
              @click="save_group_name"
            />
          </div>
        </th>
      </tr>
      <tr class="w-auto">
        <th class="border-separate border border-slate-500 bg-slate-200 p-4 text-center text-black">
          Équipe
        </th>
        <th class="m-4 border-separate truncate border border-slate-500 bg-slate-200 p-4 text-center leading-none text-black">
          Score
          <p class="text-lg">
            (tiebreak)
            <fa-awesome-icon
              class="hover:cursor-pointer"
              icon="fa-solid fa-save"
              size="lg"
              title="Save tiebreak scores"
              @click="save_tiebreak_scores"
            />
          </p>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="score, team_id in group.scores" :key="team_id">
        <td class="border-separate truncate border border-slate-500 p-4 text-center">
          {{ get_validated_team_by_id(team_id)?.name }}
        </td>
        <td class="border-separate border border-slate-500 p-4 text-center">
          {{ score }}
          (<input
            id="tiebreak"
            v-model="data_tiebreak[team_id]"
            :class="{ 'text-orange-300': data_tiebreak[team_id] !== (Object.keys(group.tiebreak_scores).includes(team_id.toString()) ? group.tiebreak_scores[team_id] : 0) }"
            class="border-0 border-b-2 bg-inherit p-0 text-center text-3xl"
            type="number"
            name="tieabreak"
            size="1"
          >)
        </td>
      </tr>
    </tbody>
  </table>

  <Modal v-if="modal_open">
    <template #title>
      <h3>
        Suppression de la {{ group.name }}
      </h3>
    </template>
    <template #body>
      La {{ group.name }} va être supprimée ainsi que tous les matchs qui lui sont liés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_group(true)"
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

<style>
input[type="number"] {
  appearance: textfield;
}
</style>
