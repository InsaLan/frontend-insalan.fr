<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import AdminGroups from '@/components/Tournament/Admin/AdminGroups.vue';
import AdminGroupsMatchs from '@/components/Tournament/Admin/AdminGroupsMatchs.vue';
import GroupDetail from '@/components/Tournament/GroupDetail.vue';
import GroupTable from '@/components/Tournament/GroupTable.vue';
import SwissRoundTable from '@/components/Tournament/SwissRoundTable.vue';
import { BracketType } from '@/models/bracket';
import type { Group } from '@/models/group.js';
import { BestofType } from '@/models/match';
import type { Stage } from '@/models/stage';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  maxLength,
  minLength,
  minValue,
  required,
} from '@/support/locales/errors';

import Bracket from './Bracket.vue';

const { tournament, admin } = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
  admin: boolean;
}>();

const { addNotification } = useNotificationStore();
const { t } = useI18n();

const {
  createBracket,
  createGroups,
  createSwiss,
  createStage,
  updateStage,
  deleteStage,
} = useTournamentStore();

const { tourney_teams } = storeToRefs(useTournamentStore());
const validated_teams_count = tourney_teams.value.validated_teams.length;

const selected_stage = ref(tournament.stages.at(0)?.id ?? 0);
const selected_stage_name = computed(() => tournament.stages.filter((s) => s.id === selected_stage.value).at(0)?.name ?? '');

const brackets = computed(() => tournament.brackets.filter((b) => b.stage === selected_stage.value));
const groups = computed(() => tournament.groups.filter((b) => b.stage === selected_stage.value));
const swiss_rounds = computed(() => tournament.swissRounds.filter((b) => b.stage === selected_stage.value));

const group_detail = ref<Group | undefined>(undefined);

const show_groups_matchs = ref(false);

const create_stage_modal = ref(false);
const edit_stage = ref(0);
const delete_stage_id = ref(0);

const stage_data = reactive({
  name: '',
  index: tournament.stages.length + 1,
});
const stage_rules = computed(() => ({
  name: { required },
  index: {},
}));

const v$ = useVuelidate(stage_rules, stage_data, { $scope: false });

const create_stage = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  const res = await createStage({ tournament: tournament.id, ...stage_data });

  if (res) addNotification(t('components.tournament.tournamentStages.stageCreated'), 'info');

  create_stage_modal.value = false;
};

const update_stage = async (stage_id: number) => {
  const res = await updateStage({
    id: stage_id,
    name: stage_data.name,
    index: (tournament.stages.filter((s: Stage) => s.id === stage_id).at(0) as Stage).index,
  });

  if (res) addNotification(t('components.tournament.tournamentStages.stageUpdated'), 'info');

  edit_stage.value = 0;
};

const delete_stage = async (stage_id: number) => {
  const res = await deleteStage(stage_id);

  if (res) addNotification(t('components.tournament.tournamentStages.stageDeleted'), 'info');

  delete_stage_id.value = 0;
  selected_stage.value = tournament.stages.at(0)?.id ?? 0;
};

const add_format_modal = ref(false);
const format_type = ref('');

const bracket_data = reactive({
  name: '',
  team_count: 0,
  bracket_type: BracketType.SINGLE,
  bo_type: BestofType.BO1,
  play_all: false,
});
const bracket_rules = computed(() => ({
  name: { required },
  team_count: { required, between: between(2, validated_teams_count) },
  bracket_type: { required },
  bo_type: { required },
  play_all: { required },
}));

const v_bracket$ = useVuelidate(bracket_rules, bracket_data, { $scope: false });

const add_bracket = async () => {
  const is_valid = await v_bracket$.value.$validate();

  if (!is_valid) return;

  const res = await createBracket(selected_stage.value, bracket_data);

  if (res) addNotification(t('components.tournament.tournamentStages.bracketCreated', { name: bracket_data.name }), 'info');

  add_format_modal.value = false;
};

const group_data = reactive({
  count: 0,
  team_per_group: 0,
  names: [''],
  use_seeding: false,
  auto_fill: false,
  round_count: -1 as number | null,
});

const update_names = (event: Event) => {
  const names = (event.target as HTMLInputElement)?.value.split(',').map((n) => n.trim());
  group_data.names = names;
};

const rules_group = computed(() => ({
  count: {
    required,
    integer,
    between: between(1, (validated_teams_count ?? 0) / 2),
  },
  team_per_group: {
    required,
    integer,
    between: between(2, validated_teams_count),
  },
  names: { minLength: minLength(group_data.count) },
  use_seeding: { required },
  auto_fill: { required },
  round_count: { integer, required },
}));

const v_group$ = useVuelidate(rules_group, group_data, { $scope: false });

const add_groups = async () => {
  const is_valid = await v_group$.value.$validate();

  if (!is_valid) return;

  if (group_data.round_count !== null && group_data.round_count < 0) {
    group_data.round_count = null;
  }

  const res = await createGroups(selected_stage.value, group_data);

  if (res) addNotification(t('components.tournament.tournamentStages.groupsCreated'), 'info');

  add_format_modal.value = false;
};

const swiss_data = reactive({
  name: '',
  min_score: 1 as number | null,
  use_seeding: false,
  bo_type: BestofType.BO1,
  auto_fill: false,
  team_count: 1,
  play_all: false,
  round_count: 1 as number | null,
});
const swiss_rules = computed(() => ({
  name: { required, maxLength: maxLength(40) },
  min_score: { integer, minValue: minValue(1) },
  use_seeding: { required },
  bo_type: { required },
  auto_fill: { required },
  team_count: { required, between: between(1, validated_teams_count) },
  play_all: { required },
  round_count: { integer, minValue: minValue(1) },
}));

const use_round_count = ref(false);

const v_swiss$ = useVuelidate(swiss_rules, swiss_data, { $scope: false });

const add_swiss = async () => {
  const is_valid = await v_swiss$.value.$validate();

  if (!is_valid) return;

  if (use_round_count.value) {
    swiss_data.min_score = null;
  } else {
    swiss_data.round_count = null;
  }

  const res = await createSwiss(selected_stage.value, swiss_data);

  if (res) addNotification(t('components.tournament.tournamentStages.swissRoundCreated'), 'info');

  add_format_modal.value = false;
};

const add_format = async () => {
  switch (format_type.value) {
    case 'bracket':
      await add_bracket();
      break;
    case 'group':
      await add_groups();
      break;
    case 'swiss':
      await add_swiss();
      break;
    default:
  }
};

const has_formats = computed(() => !(
  tournament.groups.length === 0
  && tournament.swissRounds.length === 0
  && tournament.brackets.length === 0));
const selected_format = ref('group');

const edit_bo_type = (event: Event, data: { bo_type: BestofType; play_all: boolean }) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (value > 0 && value % 2 === 0) {
    data.bo_type = value + 1;
    data.play_all = true;
  } else {
    data.bo_type = value;
    data.play_all = false;
  }
};
</script>

<template>
  <section
    id="stages"
    class="u-mx-2 l-flex-column l-gap-2"
  >
    <template
      v-if="tournament.stages.length === 0 && !has_formats && !admin"
    >
      <p class="u-big-text u-text-center">
        {{ $t('components.tournament.tournamentStages.stagesUnavailable') }}
      </p>
    </template>
    <!-- This case is for the archive tournaments, so we don't need to have an admin version of it -->
    <template
      v-if="tournament.stages.length === 0 && has_formats"
    >
      <div class="l-flex-row l-wrap l-main-center l-cross-center l-gap-2">
        <button
          v-for="(format_name, format) in {
            group: $t('components.tournament.tournamentStages.groups'),
            swiss: $t('components.tournament.tournamentStages.swissRound'),
            bracket: $t('components.tournament.tournamentStages.brackets'),
          }"
          :key="format"
          type="button"
          :class="format === selected_format ? 'c-btn-bg-3' : 'c-btn-bg-2 u-color-text-2'"
          @click="selected_format = format"
        >
          {{ format_name }}
        </button>
      </div>

      <section v-if="selected_format === 'bracket'" id="brackets">
        <div
          v-if="tournament.brackets.length === 0"
          class="u-text-center u-big-text"
        >
          {{ $t('components.tournament.tournamentStages.bracketsUnavailable') }}
        </div>
        <div
          v-else
          class="l-flex-column l-gap-4"
        >
          <div
            v-for="bracket in tournament.brackets"
            :key="bracket.id"
          >
            <Bracket
              :bracket="bracket"
              :admin="false"
            />
          </div>
        </div>
      </section>

      <section
        v-if="selected_format === 'group'"
        id="groups"
      >
        <div
          v-if="tournament.groups.length === 0"
          class="u-text-center u-big-text"
        >
          {{ $t('components.tournament.tournamentStages.groupsUnavailable') }}
        </div>
        <div
          v-else
          id="groups"
          class="l-flex-row l-wrap l-gap-2 l-main-center"
        >
          <template
            v-if="group_detail === undefined"
          >
            <GroupTable
              v-for="group in tournament.groups"
              :key="group.id"
              :group="group"
              @detail="group_detail = group"
            />
          </template>
          <template
            v-else
          >
            <GroupDetail
              :group="group_detail"
              @back="group_detail = undefined"
            />
          </template>
        </div>
      </section>

      <section
        v-if="selected_format === 'swiss'"
        id="swiss_rounds"
      >
        <div
          v-if="tournament.swissRounds.length === 0"
          class="u-text-center u-big-text"
        >
          {{ $t('components.tournament.tournamentStages.swissRoundsUnavailable') }}
        </div>
        <SwissRoundTable
          v-for="swiss in tournament.swissRounds"
          v-else
          :key="swiss.id"
          :swiss="swiss"
          :admin="false"
        />
      </section>
    </template>
    <template
      v-else-if="admin"
    >
      <div
        class="l-flex-row l-wrap l-main-center l-cross-center l-gap-2"
      >
        <button
          v-for="stage in tournament.stages"
          :key="stage.id"
          type="button"
          :class="stage.id === selected_stage ? 'c-btn-bg-3' : 'c-btn-bg-2 u-color-text-2'"
          @click="selected_stage = stage.id"
        >
          <div
            v-if="edit_stage === stage.id"
            class="u-big-text l-flex-row l-cross-center"
          >
            <input
              id="stage_name"
              v-model="stage_data.name"
              name="stage_name"
              type="text"
              class="u-mr-1"
              :size="stage_data.name.length"
              @click.stop
            >
            <button
              type="button"
              :title="$t('components.tournament.tournamentStages.saveStage')"
              @click.stop="update_stage(stage.id)"
            >
              <fa-awesome-icon
                class="c-inline-icon c-image-btn"
                icon="fa-save"
              />
            </button>
            <button
              type="button"
              :title="$t('components.tournament.tournamentStages.cancel')"
              @click.stop="edit_stage = 0"
            >
              <fa-awesome-icon
                class="c-inline-icon c-image-btn u-mr-0"
                icon="fa-xmark"
              />
            </button>
          </div>
          <div
            v-else
            class="u-big-text"
          >
            {{ stage.name }}
            <button
              type="button"
              :title="$t('components.tournament.tournamentStages.editStage')"
              @click.stop="edit_stage = stage.id; stage_data.name = stage.name"
            >
              <fa-awesome-icon
                class="c-inline-icon c-image-btn"
                icon="fa-pencil"
              />
            </button>
            <button
              type="button"
              :title="$t('components.tournament.tournamentStages.deleteStage')"
              @click.stop="delete_stage_id = stage.id"
            >
              <fa-awesome-icon
                class="c-inline-icon c-image-btn u-color-error-1 u-mr-0"
                icon="fa-trash-can"
              />
            </button>
          </div>
        </button>
      </div>
      <div class="l-flex-row l-wrap l-main-center l-cross-center l-gap-2">
        <button
          type="button"
          class="c-btn-primary"
          @click="create_stage_modal = true"
        >
          {{ $t('components.tournament.tournamentStages.newStage') }}
        </button>
        <button
          type="button"
          class="c-btn-secondary"
          @click="add_format_modal = true"
        >
          {{ $t('components.tournament.tournamentStages.addFormat') }}
        </button>
      </div>

      <section
        v-if="groups.length !== 0"
        id="groups"
        class="l-flex-column l-main-center l-cross-center l-gap-2"
      >
        <AdminGroupsMatchs
          v-if="show_groups_matchs"
          v-model="show_groups_matchs"
          :groups="groups"
        />
        <AdminGroups
          v-else
          v-model="show_groups_matchs"
          :groups="groups"
        />
      </section>

      <section
        v-if="swiss_rounds.length !== 0"
        id="swiss_rounds"
      >
        <SwissRoundTable
          v-for="swiss in swiss_rounds"
          :key="swiss.id"
          :swiss="swiss"
          :admin="true"
        />
      </section>

      <section
        v-if="brackets.length !== 0"
        id="brackets"
      >
        <Bracket
          v-for="bracket in brackets"
          :key="bracket.id"
          :bracket="bracket"
          :admin="true"
        />
      </section>
    </template>
    <template v-else>
      <div class="l-flex-row l-wrap l-gap-2 l-main-center l-cross-center">
        <button
          v-for="stage in tournament.stages"
          :key="stage.id"
          type="button"
          :class="stage.id === selected_stage ? 'c-btn-bg-3' : 'c-btn-bg-2 u-color-text-2'"
          @click="selected_stage = stage.id"
        >
          {{ stage.name }}
        </button>
      </div>

      <section
        v-if="groups.length !== 0"
        id="groups"
        class="l-flex-row l-wrap l-gap-2 l-main-center"
      >
        <template
          v-if="group_detail === undefined"
        >
          <GroupTable
            v-for="group in groups"
            :key="group.id"
            :group="group"
            @detail="group_detail = group"
          />
        </template>
        <template
          v-else
        >
          <GroupDetail
            :group="group_detail"
            @back="group_detail = undefined"
          />
        </template>
      </section>

      <section
        v-if="swiss_rounds.length !== 0"
        id="swiss_rounds"
      >
        <SwissRoundTable
          v-for="swiss in swiss_rounds"
          :key="swiss.id"
          :swiss="swiss"
          :admin="false"
        />
      </section>

      <section
        v-if="brackets.length !== 0"
        id="brackets"
      >
        <Bracket
          v-for="bracket in brackets"
          :key="bracket.id"
          :bracket="bracket"
          :admin="false"
        />
      </section>
    </template>
  </section>

  <Modal
    v-if="create_stage_modal"
    @close="create_stage_modal = false"
  >
    <template #title>
      {{ $t('components.tournament.tournamentStages.newTournamentStage') }}
    </template>
    <template #body>
      <form
        id="create_phase"
        @submit.prevent="create_stage()"
      >
        <FormField :validations="v$.name">
          <label for="stage_name">
            {{ $t('components.tournament.tournamentStages.stageName') }}
          </label>
          <input
            id="stage_name"
            v-model="stage_data.name"
            type="text"
            name="stage_name"
            @blur="v$.name.$touch"
          />
        </FormField>
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="create_stage_modal = false"
      >
        {{ $t('components.tournament.tournamentStages.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="create_stage()"
      >
        {{ $t('components.tournament.tournamentStages.validate') }}
      </button>
    </template>
  </Modal>

  <Modal
    v-if="delete_stage_id !== 0"
    @close="delete_stage_id = 0;"
  >
    <template #title>
      {{ $t('components.tournament.tournamentStages.deleteStage') }}
    </template>
    <template #body>
      {{ $t('components.tournament.tournamentStages.deleteStageDescription') }}
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="delete_stage_id = 0;"
      >
        {{ $t('components.tournament.tournamentStages.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="delete_stage(delete_stage_id)"
      >
        {{ $t('components.tournament.tournamentStages.validate') }}
      </button>
    </template>
  </Modal>

  <Modal
    v-if="add_format_modal"
    @close="add_format_modal = false"
  >
    <template #title>
      {{ $t('components.tournament.tournamentStages.addFormatToStage', { name: selected_stage_name }) }}
    </template>
    <template #body>
      <form
        id="add_format"
        class="l-flex-column l-gap-2"
        @submit.prevent="add_format()"
      >
        <FormField
          :validations="v$"
        >
          <label for="format_type">
            {{ $t('components.tournament.tournamentStages.formatType') }}
          </label>
          <select
            id="format_type"
            v-model="format_type"
            name="format_type"
          >
            <option value="bracket">
              {{ $t('components.tournament.tournamentStages.bracket') }}
            </option>
            <option value="group">
              {{ $t('components.tournament.tournamentStages.groups') }}
            </option>
            <option value="swiss">
              {{ $t('components.tournament.tournamentStages.swissRound') }}
            </option>
          </select>
        </FormField>
        <template
          v-if="format_type === 'bracket'"
        >
          <FormField
            :validations="v_bracket$.name"
          >
            <label for="bracket_name">
              {{ $t('components.tournament.tournamentStages.bracketName') }}
            </label>
            <input
              id="bracket_name"
              v-model="bracket_data.name"
              type="text"
              name="bracket_name"
              :aria-label="$t('components.tournament.tournamentStages.bracketName')"
              @blur="v_bracket$.name.$touch"
            />
          </FormField>
          <FormField
            :validations="v_bracket$.bracket_type"
          >
            <label for="bracket_type">
              {{ $t('components.tournament.tournamentStages.bracketType') }}
            </label>
            <select
              id="bracket_type"
              v-model="bracket_data.bracket_type"
              :aria-label="$t('components.tournament.tournamentStages.bracketType')"
              @blur="v_bracket$.bracket_type.$touch"
            >
              <option
                v-for="bracket_type in Object.keys(BracketType).filter((v) => !Number.isInteger(Number(v)))"
                :key="bracket_type"
                :value="bracket_type"
              >
                {{ bracket_type === BracketType.SINGLE ? $t('components.tournament.tournamentStages.singleElimination') : $t('components.tournament.tournamentStages.doubleElimination') }}
              </option>
            </select>
          </FormField>
          <FormField
            :validations="v_bracket$.team_count"
          >
            <label for="bracket_team_count">
              {{ $t('components.tournament.tournamentStages.teamCount') }}
            </label>
            <input
              id="bracket_team_count"
              v-model.number="bracket_data.team_count"
              name="bracket_team_count"
              type="number"
              @blur="v_bracket$.team_count.$touch"
            />
          </FormField>
          <FormField
            :validations="v_bracket$.bo_type"
          >
            <label for="bo_type">
              {{ $t('components.tournament.tournamentStages.boType') }}
            </label>
            <select
              id="bo_type"
              name="bo_type"
              :value="bracket_data.bo_type"
              @blur="v_bracket$.bo_type.$touch"
              @change="(e) => edit_bo_type(e, bracket_data)"
            >
              <option
                v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
                :key="value"
                :value="value"
              >
                {{ value === '0' ? $t('components.tournament.tournamentStages.classification') : $t('components.tournament.tournamentStages.bestOf', { value }) }}
              </option>
              <option
                v-for="value in Object.keys(BestofType).map(Number).filter((v) => Number.isInteger(v) && v > 1)"
                :key="value - 1"
                :value="value - 1"
              >
                {{ $t('components.tournament.tournamentStages.playAll', { value }) }}
              </option>
            </select>
          </FormField>
        </template>
        <template
          v-if="format_type === 'group'"
        >
          <FormField
            :validations="v_group$.count"
          >
            <label for="group_count">
              {{ $t('components.tournament.tournamentStages.groupCount') }}
            </label>
            <input
              id="group_count"
              v-model="group_data.count"
              :aria-label="$t('components.tournament.tournamentStages.groupCount')"
              type="number"
              @blur="v_group$.count.$touch"
            >
          </FormField>
          <FormField
            :validations="v_group$.team_per_group"
          >
            <label for="team_per_group">
              {{ $t('components.tournament.tournamentStages.teamsPerGroup') }}
            </label>
            <input
              id="team_per_group"
              v-model="group_data.team_per_group"
              :aria-label="$t('components.tournament.tournamentStages.teamsPerGroup')"
              type="number"
              @blur="v_group$.team_per_group.$touch"
            >
          </FormField>
          <FormField
            :validations="v_group$.names"
          >
            <label for="names">
              {{ $t('components.tournament.tournamentStages.groupNames') }}
            </label>
            <input
              id="names"
              :aria-label="$t('components.tournament.tournamentStages.groupNames')"
              type="text"
              :value="group_data.names.join(',')"
              @input="update_names"
              @blur="v_group$.names.$touch"
            >
          </FormField>
          <FormField
            :validations="v_group$.use_seeding"
          >
            <label for="auto_fill">
              {{ $t('components.tournament.tournamentStages.autoFillGroups') }}
            </label>
            <input
              id="auto_fill"
              v-model="group_data.auto_fill"
              :aria-label="$t('components.tournament.tournamentStages.autoFillGroups')"
              type="checkbox"
              @blur="v_group$.auto_fill.$touch"
            >
          </FormField>
          <FormField
            :validations="v_group$.use_seeding"
          >
            <label for="seeding">
              {{ $t('components.tournament.tournamentStages.useTeamSeeding') }}
            </label>
            <input
              id="seeding"
              v-model="group_data.use_seeding"
              :disabled="!group_data.auto_fill"
              :aria-label="$t('components.tournament.tournamentStages.useTeamSeeding')"
              type="checkbox"
              @blur="v_group$.use_seeding.$touch"
            >
          </FormField>
          <FormField
            :validations="v_group$.round_count"
          >
            <label for="group_round_count">
              {{ $t('components.tournament.tournamentStages.groupRoundCount') }}
            </label>
            <input
              id="group_round_count"
              v-model="group_data.round_count"
              type="number"
              :aria-label="$t('components.tournament.tournamentStages.roundCount')"
              @blur="v_group$.round_count.$touch"
            >
          </FormField>
        </template>
        <template
          v-if="format_type === 'swiss'"
        >
          <FormField
            :validations="v_swiss$.name"
          >
            <label for="swiss_name">
              {{ $t('components.tournament.tournamentStages.swissRoundName') }}
            </label>
            <input
              id="swiss_name"
              v-model="swiss_data.name"
              type="text"
              :aria-label="$t('components.tournament.tournamentStages.swissRoundName')"
              @blur="v_swiss$.name.$touch"
            >
          </FormField>
          <FormField
            :validations="v_swiss$.team_count"
          >
            <label for="swiss_team_count">
              {{ $t('components.tournament.tournamentStages.teamCount') }}
            </label>
            <input
              id="swiss_team_count"
              v-model="swiss_data.team_count"
              type="number"
              name="swiss_team_count"
              :aria-label="$t('components.tournament.tournamentStages.teamCount')"
              @blur="v_swiss$.team_count.$touch"
            />
          </FormField>
          <FormField
            :validations="v_swiss$.min_score"
          >
            <div
              class="l-flex-row l-main-center l-gap-2"
            >
              <button
                type="button"
                @click="use_round_count = false"
              >
                <label
                  for="min_score"
                  class="switch-btn"
                  :class="{ active: !use_round_count }"
                >
                  {{ $t('components.tournament.tournamentStages.qualificationScore') }}
                </label>
              </button>
              <button
                type="button"
                @click="use_round_count = true"
              >
                <label
                  for="round_count"
                  class="switch-btn"
                  :class="{ active: use_round_count }"
                >
                  {{ $t('components.tournament.tournamentStages.roundCount') }}
                </label>
              </button>
            </div>
            <input
              v-if="use_round_count"
              id="round_count"
              v-model="swiss_data.round_count"
              type="number"
              name="round_count"
              :aria-label="$t('components.tournament.tournamentStages.roundCount')"
              @blur="v_swiss$.round_count.$touch"
            />
            <input
              v-else
              id="min_score"
              v-model="swiss_data.min_score"
              type="number"
              name="min_score"
              :aria-label="$t('components.tournament.tournamentStages.qualificationScore')"
              @blur="v_swiss$.min_score.$touch"
            />
          </FormField>
          <FormField
            :validations="v_swiss$.use_seeding"
          >
            <label for="auto_fill">
              {{ $t('components.tournament.tournamentStages.autoFillSwissRound') }}
            </label>
            <input
              id="auto_fill"
              v-model="swiss_data.auto_fill"
              :aria-label="$t('components.tournament.tournamentStages.autoFillSwissRound')"
              type="checkbox"
              @blur="v_swiss$.auto_fill.$touch"
            >
          </FormField>
          <FormField
            :validations="v_swiss$.use_seeding"
          >
            <label for="seeding">
              {{ $t('components.tournament.tournamentStages.useTeamSeeding') }}
            </label>
            <input
              id="seeding"
              v-model="swiss_data.use_seeding"
              :disabled="!swiss_data.auto_fill"
              :aria-label="$t('components.tournament.tournamentStages.useTeamSeeding')"
              type="checkbox"
              @blur="v_swiss$.use_seeding.$touch"
            >
          </FormField>
          <FormField
            :validations="v_swiss$.bo_type"
          >
            <label for="bo_type">
              {{ $t('components.tournament.tournamentStages.boType') }}
            </label>
            <select
              id="bo_type"
              name="bo_type"
              :value="swiss_data.bo_type"
              @blur="v_swiss$.bo_type.$touch"
              @change="(e) => edit_bo_type(e, swiss_data)"
            >
              <option
                v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
                :key="value"
                :value="value"
              >
                {{ value === '0' ? $t('components.tournament.tournamentStages.classification') : $t('components.tournament.tournamentStages.bestOf', { value }) }}
              </option>
              <option
                v-for="value in Object.keys(BestofType).map(Number).filter((v) => Number.isInteger(v) && v > 1)"
                :key="value - 1"
                :value="value - 1"
              >
                {{ $t('components.tournament.tournamentStages.playAll', { value }) }}
              </option>
            </select>
          </FormField>
        </template>
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="add_format_modal = false"
      >
        {{ $t('components.tournament.tournamentStages.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click="add_format()"
      >
        {{ $t('components.tournament.tournamentStages.validate') }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.switch-btn {
  color: var(--color-text-2);
  cursor: pointer;
  transition: color 0.2s;
  font-size: 1.2rem;
  font-weight: 500;
}

.switch-btn:hover, .switch-btn.active {
  color: var(--color-text-1);
}
</style>
