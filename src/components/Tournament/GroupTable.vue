<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import Modal from '@/components/Modal.vue';
import type { Group } from '@/models/group';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import { between, integer, required } from '@/support/locales/errors.fr';

const { group, editable = false } = defineProps<{
  group: Group;
  editable?: boolean;
}>();

const TournamentStore = useTournamentStore();
const { get_validated_team_by_id, editGroup, deleteGroup } = TournamentStore;
const { validated_teams } = storeToRefs(TournamentStore).tourney_teams.value;

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const { isAdmin } = storeToRefs(useUserStore());

const modal_open = ref(false);
const edit_mode = ref(false);

const group_data = reactive({
  name: group.name,
  teams: Object.keys(group.scores).map((team) => Number(team)).concat(0),
  seeding: validated_teams
    .map((t) => t.id)
    .reduce((res, t) => {
      if (group.seeding !== undefined && Object.keys(group.seeding).includes(t.toString())) {
        res[t] = group.seeding[t];
      } else {
        res[t] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>),
  tiebreak_scores: validated_teams
    .map((t) => t.id)
    .reduce((res, t) => {
      if (Object.keys(group.tiebreak_scores).includes(t.toString())) {
        res[t] = group.tiebreak_scores[t];
      } else {
        res[t] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>),
});

const group_rules = computed(() => ({
  name: { required },
  teams: { required },
  seeding: validated_teams
    .map((t) => t.id)
    .reduce(
      (res, t) => {
        res[t] = { required, integer, between: between(0, group_data.teams.length - 1) };
        return res;
      },
      {
        0: { required, integer, between: between(0, group_data.teams.length - 1) },
      } as Record<string, { required: ValidationRule; integer: ValidationRule; between: ValidationRule }>,
    ),
  tiebreak_scores: validated_teams
    .map((t) => t.id)
    .reduce((res, t) => {
      res[t] = { required, integer };
      return res;
    }, { 0: { required, integer } } as Record<string, { required: ValidationRule; integer: ValidationRule }>),
}));

const reset = () => {
  group_data.name = group.name;
  group_data.teams = Object.keys(group.scores).map((team) => Number(team)).concat(0);
  group_data.seeding = validated_teams
    .map((t) => t.id)
    .reduce((res, t) => {
      if (group.seeding !== undefined && Object.keys(group.seeding).includes(t.toString())) {
        res[t] = group.seeding[t];
      } else {
        res[t] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>);
  group_data.tiebreak_scores = validated_teams
    .map((t) => t.id)
    .reduce((res, t) => {
      if (Object.keys(group.tiebreak_scores).includes(t.toString())) {
        res[t] = group.tiebreak_scores[t];
      } else {
        res[t] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>);
};

const v$ = useVuelidate(group_rules, group_data);

const edit_group = async () => {
  const group_data_clean = { ...group_data };
  group_data_clean.teams = group_data_clean.teams.filter((t) => t !== 0);
  group_data_clean.seeding = Object.fromEntries(
    Object.entries(group_data_clean.seeding).filter(([team_id]) => group_data_clean.teams.includes(Number(team_id))),
  );
  group_data_clean.tiebreak_scores = Object.fromEntries(
    Object.entries(group_data_clean.tiebreak_scores)
      .filter(([team_id]) => group_data_clean.teams.includes(Number(team_id))),
  );

  await editGroup(group.id, group_data_clean);

  addNotification('Les informations de la poule ont bien été sauvegardées.', 'info');
  edit_mode.value = false;
};

const delete_group = async (confirm: boolean) => {
  if (!confirm) {
    modal_open.value = true;
    return;
  }

  const res = await deleteGroup(group.id);

  if (res) addNotification('La poule à bien été supprimée', 'info');

  modal_open.value = false;
};

const open_edit = () => {
  if (editable) {
    reset();
    edit_mode.value = true;
  }
};

watchEffect(() => {
  if (group_data.teams.filter((t) => t === 0).length > 1) {
    group_data.teams = group_data.teams.filter((t) => t !== 0);
  }
  if (group_data.teams.filter((t) => t === 0).length === 0) {
    group_data.teams.push(0);
  }
});
</script>

<template>
  <div
    v-bind="$attrs"
    class="rounded bg-cyan-900 font-black shadow-md"
    style="text-shadow: black 0 0 2px;"
  >
    <div
      class="grid grid-cols-[1fr,3fr,1fr] l-items-cross-center rounded-t bg-cyan-500 py-2 text-center text-3xl"
    >
      <div/>
      <template v-if="!edit_mode">
        {{ group.name }}
        <div
          v-if="editable"
        >
          <fa-awesome-icon
            class="hover:cursor-pointer hover:text-gray-500"
            icon="fa-solid fa-pencil"
            size="2xs"
            title="Éditer la poule"
            @click="open_edit"
          />
          <fa-awesome-icon
            class="ml-2 text-red-500 hover:cursor-pointer hover:text-red-700"
            icon="fa-solid fa-trash-can"
            size="2xs"
            title="Supprimer la poule"
            @click="delete_group(false)"
          />
        </div>
      </template>
      <template v-else>
        <input
          id="group_name"
          v-model="group_data.name"
          class="bg-inherit p-0 text-center text-3xl"
          style="text-shadow: black 0 0 2px;"
          type="text"
          name="group_name"
          :size="group_data.name.length"
        >
        <div>
          <fa-awesome-icon
            class="px-2 text-green-700 hover:cursor-pointer hover:text-green-900"
            icon="fa-solid fa-save"
            size="sm"
            title="Sauvegarder la poule"
            @click="edit_group"
          />
          <fa-awesome-icon
            class="text-red-500 hover:cursor-pointer hover:text-red-700"
            icon="fa-solid fa-xmark"
            size="sm"
            title="Annuler"
            @click="edit_mode = false; reset()"
          />
        </div>
      </template>
    </div>

    <div
      v-if="v$.$invalid"
      class="bg-red-500 text-center"
    >
      {{ v$.$errors.at(0)?.$message }}
    </div>

    <div
      class="grid l-items-cross-center l-items-main-center gap-y-2 p-2 text-center text-xl"
      :class="[editable && isAdmin ? 'grid-cols-[1fr,3fr,1fr]' : 'grid-cols-[4fr,1fr]']"
    >
      <div
        v-if="editable && isAdmin"
        class="flex h-full l-items-cross-center l-items-main-center border-b-2 text-2xl"
      >
        Seed
      </div>
      <div
        class="flex h-full l-items-cross-center l-items-main-center border-b-2 text-2xl"
      >
        Équipes
      </div>
      <div
        class="border-b-2 py-2 text-2xl"
      >
        Score
        <p
          class="text-sm"
        >
          (tiebreak)
        </p>
      </div>

      <template
        v-if="!edit_mode"
      >
        <template
          v-for="score, team_id in group.scores"
          :key="team_id"
        >
          <div
            v-if="editable && isAdmin"
          >
            {{ group.seeding ? group.seeding[team_id] : 0 }}
          </div>
          <div
            class="truncate px-2"
          >
            {{
              get_validated_team_by_id(team_id)?.name
            }}
          </div>
          <div>
            {{ score }} {{ group.tiebreak_scores[team_id] !== 0 ? `(${Intl.NumberFormat('fr-FR', { signDisplay: 'always' }).format(group.tiebreak_scores[team_id])})` : (editable && isAdmin) ? '(0)' : '' }}
          </div>
        </template>
      </template>

      <template
        v-else
      >
        <template
          v-for="idx in group_data.teams.length"
          :key="group_data.teams[idx - 1]"
        >
          <div
            v-if="editable && isAdmin"
          >
            <input
              id="seed"
              v-model.number="group_data.seeding[group_data.teams[idx - 1]]"
              type="number"
              name="seed"
              class="w-10 bg-inherit p-1 text-center"
              :class="{ error: v$.seeding[group_data.teams[idx - 1]].$error }"
              style="appearance: textfield;"
              @blur="v$.seeding[group_data.teams[idx - 1]].$touch"
            />
          </div>
          <div
            class="flex min-w-0"
          >
            <select
              id="select_team"
              v-model="group_data.teams[idx - 1]"
              name="select_team"
              class="w-full truncate bg-inherit py-1 pl-1"
              @blur="v$.teams.$touch"
            >
              <option :value="0">
                TBD
              </option>
              <option
                v-for="team in validated_teams.filter(
                  (team) => !group_data.teams.includes(team.id) || team.id === group_data.teams[idx - 1],
                )"
                :key="team.id"
                :value="team.id"
              >
                {{ team.name }}
              </option>
            </select>
          </div>
          <div>
            {{ group.scores[group_data.teams[idx - 1]] ?? 0 }}
            (<input
              id="seed"
              v-model.number="group_data.tiebreak_scores[group_data.teams[idx - 1]]"
              type="number"
              name="seed"
              class="w-10 bg-inherit p-1 text-center"
              :class="{ error: v$.tiebreak_scores[group_data.teams[idx - 1]].$error }"
              style="appearance: textfield;"
              @blur="v$.tiebreak_scores[group_data.teams[idx - 1]].$touch"
            />)
          </div>
        </template>
      </template>
    </div>
  </div>

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
        class="c-btn-bg-3"
        type="button"
        @click="modal_open = false;"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="delete_group(true)"
      >
        Valider
      </button>
    </template>
  </Modal>
</template>
