<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/components/Modal.vue';
import type { Group } from '@/models/group';
import type { Team } from '@/models/team';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import { between, integer, required } from '@/support/locales/errors';

const { group, editable = false } = defineProps<{
  group: Group;
  editable?: boolean;
  onDetail?: () => void;
  onBack?: () => void;
}>();

const TournamentStore = useTournamentStore();
const { get_validated_team_by_id, editGroup, deleteGroup } = TournamentStore;
const { validated_teams } = storeToRefs(TournamentStore).tourney_teams.value;

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const { isAdmin } = storeToRefs(useUserStore());
const { t } = useI18n();

const modal_open = ref(false);
const edit_mode = ref(false);

const group_data = reactive({
  name: group.name,
  teams: Object.keys(group.scores).map((team) => Number(team)).concat(0),
  seeding: validated_teams
    .map((u) => u.id)
    .reduce((res, u) => {
      if (group.seeding !== undefined && Object.keys(group.seeding).includes(u.toString())) {
        res[u] = group.seeding[u];
      } else {
        res[u] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>),
  tiebreak_scores: validated_teams
    .map((u) => u.id)
    .reduce((res, u) => {
      if (Object.keys(group.tiebreak_scores).includes(u.toString())) {
        res[u] = group.tiebreak_scores[u];
      } else {
        res[u] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>),
});

const group_rules = computed(() => ({
  name: { required },
  teams: { required },
  seeding: validated_teams
    .map((u) => u.id)
    .reduce(
      (res, u) => {
        res[u] = { required, integer, between: between(0, group_data.teams.length - 1) };
        return res;
      },
      {
        0: { required, integer, between: between(0, group_data.teams.length - 1) },
      } as Record<string, { required: ValidationRule; integer: ValidationRule; between: ValidationRule }>,
    ),
  tiebreak_scores: validated_teams
    .map((u) => u.id)
    .reduce((res, u) => {
      res[u] = { required, integer };
      return res;
    }, { 0: { required, integer } } as Record<string, { required: ValidationRule; integer: ValidationRule }>),
}));

const reset = () => {
  group_data.name = group.name;
  group_data.teams = Object.keys(group.scores).map((team) => Number(team)).concat(0);
  group_data.seeding = validated_teams
    .map((u) => u.id)
    .reduce((res, u) => {
      if (group.seeding !== undefined && Object.keys(group.seeding).includes(u.toString())) {
        res[u] = group.seeding[u];
      } else {
        res[u] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>);
  group_data.tiebreak_scores = validated_teams
    .map((u) => u.id)
    .reduce((res, u) => {
      if (Object.keys(group.tiebreak_scores).includes(u.toString())) {
        res[u] = group.tiebreak_scores[u];
      } else {
        res[u] = 0;
      }
      return res;
    }, { 0: 0 } as Record<string, number>);
};

const v$ = useVuelidate(group_rules, group_data);

const edit_group = async () => {
  const group_data_clean = { ...group_data };
  group_data_clean.teams = group_data_clean.teams.filter((u) => u !== 0);
  group_data_clean.seeding = Object.fromEntries(
    Object.entries(group_data_clean.seeding).filter(([team_id]) => group_data_clean.teams.includes(Number(team_id))),
  );
  group_data_clean.tiebreak_scores = Object.fromEntries(
    Object.entries(group_data_clean.tiebreak_scores)
      .filter(([team_id]) => group_data_clean.teams.includes(Number(team_id))),
  );

  await editGroup(group.id, group_data_clean);

  addNotification(t('components.tournament.groupTable.groupSaved'), 'info');
  edit_mode.value = false;
};

const delete_group = async (confirm: boolean) => {
  if (!confirm) {
    modal_open.value = true;
    return;
  }

  const res = await deleteGroup(group.id);

  if (res) addNotification(t('components.tournament.groupTable.groupDeleted'), 'info');

  modal_open.value = false;
};

const open_edit = () => {
  if (editable) {
    reset();
    edit_mode.value = true;
  }
};

watchEffect(() => {
  if (group_data.teams.filter((u) => u === 0).length > 1) {
    group_data.teams = group_data.teams.filter((u) => u !== 0);
  }
  if (group_data.teams.filter((u) => u === 0).length === 0) {
    group_data.teams.push(0);
  }
});
</script>

<template>
  <div
    v-bind="$attrs"
    class="c-card-bg-2 l-flex-column l-gap-1"
  >
    <div
      class="l-flex-row l-cross-center l-gap-1 c-card-bg-3 u-full-width u-text-center u-big-text"
    >
      <template v-if="!edit_mode">
        <button
          v-if="onBack"
          type="button"
          :title="t('components.tournament.groupTable.back')"
          @click="onBack()"
        >
          <fa-awesome-icon
            class="c-image-btn"
            icon="fa-chevron-left"
          />
        </button>
        <h2 class="u-m-0">
          {{ group.name }}
        </h2>
        <div class="l-grow"/>
        <template
          v-if="editable && isAdmin"
        >
          <button
            type="button"
            :title="t('components.tournament.groupTable.editGroup')"
            @click="open_edit"
          >
            <fa-awesome-icon
              class="c-image-btn"
              icon="fa-pencil"
            />
          </button>
          <button
            type="button"
            :title="t('components.tournament.groupTable.deleteGroup')"
            @click="delete_group(false)"
          >
            <fa-awesome-icon
              class="c-image-btn u-color-error-1 u-mr-0"
              icon="fa-trash-can"
            />
          </button>
        </template>
        <button
          v-if="onDetail"
          type="button"
          :title="t('components.tournament.groupTable.details')"
          @click="onDetail()"
        >
          <fa-awesome-icon
            class="c-image-btn"
            icon="fa-chevron-right"
          />
        </button>
      </template>
      <template v-else>
        <input
          id="group_name"
          v-model="group_data.name"
          type="text"
          name="group_name"
        >
        <button
          type="button"
          :title="t('components.tournament.groupTable.saveGroup')"
          :disabled="v$.$invalid"
          @click="edit_group"
        >
          <fa-awesome-icon
            class="c-image-btn c-inline-icon"
            icon="fa-save"
          />
        </button>
        <button
          type="button"
          :title="t('components.tournament.groupTable.cancelChanges')"
          @click="edit_mode = false; reset()"
        >
          <fa-awesome-icon
            class="c-image-btn c-inline-icon u-color-error-1 u-mr-0"
            icon="fa-xmark"
          />
        </button>
      </template>
    </div>

    <div
      v-if="v$.$invalid"
      class="c-card-error u-p-0 u-px-1 u-text-center u-full-width"
    >
      {{ v$.$errors.at(0)?.$message }}
    </div>

    <table class="u-text-center">
      <thead>
        <tr>
          <th v-if="editable && isAdmin">
            {{ t('components.tournament.groupTable.seed') }}
          </th>
          <th>
            {{ t('components.tournament.groupTable.team') }}
          </th>
          <th>
            {{ t('components.tournament.groupTable.score') }}
            <br>
            <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
            <span class="u-normal-text u-regular">
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              ({{ t('components.tournament.groupTable.tiebreak') }})
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        <template
          v-if="!edit_mode"
        >
          <tr
            v-for="score, team_id in group.scores"
            :key="team_id"
          >
            <td
              v-if="editable && isAdmin"
            >
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              {{ group.seeding ? group.seeding[team_id] : 0 }}
            </td>
            <td
              class="truncate u-px-1"
            >
              {{
                get_validated_team_by_id(team_id)?.name
              }}
            </td>
            <td>
              {{ score }} {{ group.tiebreak_scores[team_id] !== 0 ? `(${Intl.NumberFormat('fr-FR', { signDisplay: 'always' }).format(group.tiebreak_scores[team_id])})` : (editable && isAdmin) ? '(0)' : '' }}
            </td>
          </tr>
        </template>

        <template
          v-else
        >
          <tr
            v-for="idx in group_data.teams.length"
            :key="group_data.teams[idx - 1]"
          >
            <td
              v-if="editable && isAdmin"
              class="not-too-wide"
            >
              <input
                id="seed"
                v-model.number="group_data.seeding[group_data.teams[idx - 1]]"
                type="number"
                name="seed"
                @blur="v$.seeding[group_data.teams[idx - 1]].$touch"
              />
            </td>
            <td
              class="not-too-wide"
            >
              <select
                id="select_team"
                v-model="group_data.teams[idx - 1]"
                name="select_team"
                @blur="v$.teams.$touch"
              >
                <option :value="0">
                  {{ t('components.tournament.groupTable.tbd') }}
                </option>
                <option
                  v-for="team in validated_teams.filter(
                    (team: Team) => !group_data.teams.includes(team.id) || team.id === group_data.teams[idx - 1],
                  )"
                  :key="team.id"
                  :value="team.id"
                >
                  {{ team.name }}
                </option>
              </select>
            </td>
            <td
              class="l-flex-row l-cross-center"
            >
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              {{ group.scores[group_data.teams[idx - 1]] ?? 0 }}
              <!-- idk why i need so much of them but otherwise it isn't happy -->
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              (
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              <input
                id="seed"
                v-model.number="group_data.tiebreak_scores[group_data.teams[idx - 1]]"
                type="number"
                name="seed"
                class="not-too-wide"
                @blur="v$.tiebreak_scores[group_data.teams[idx - 1]].$touch"
              />
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
              )
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <Modal
    v-if="modal_open"
    @close="modal_open = false"
  >
    <template #title>
      {{ t('components.tournament.groupTable.deleteGroupTitle', { name: group.name }) }}
    </template>
    <template #body>
      {{ t('components.tournament.groupTable.deleteGroupDescription', { name: group.name }) }}
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="modal_open = false"
      >
        {{ t('components.tournament.groupTable.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="delete_group(true)"
      >
        {{ t('components.tournament.groupTable.validate') }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
  .not-too-wide {
    max-width: 12rem;
  }
</style>
