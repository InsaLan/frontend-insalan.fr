<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed,
  reactive,
  ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import FormField from '@/components/FormField.vue';
import type { KnockoutMatch } from '@/models/bracket';
import type { GroupMatch } from '@/models/group';
import {
  BestofType,
  MatchStatus,
  type MatchType,
} from '@/models/match';
import type { SwissMatch } from '@/models/swiss';
import type { Team } from '@/models/team';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import {
  between,
  maxLength,
  minLength,
  required,
} from '@/support/locales/errors.fr';

const {
  match,
  matchType,
  editable = false,
  selectable = false,
} = defineProps<{
  match: GroupMatch | KnockoutMatch | SwissMatch;
  matchType: MatchType;
  editable?: boolean;
  selectable?: boolean;
}>();

const selected_matchs = defineModel<Set<number>>({ default: new Set() });
const selected = computed(() => selected_matchs.value?.has(match.id));

const { addNotification } = useNotificationStore();
const { t } = useI18n();

const { get_validated_team_by_id, is_winning_team, patchMatch } = useTournamentStore();
const { tourney_teams, team_per_match } = storeToRefs(useTournamentStore());
const { validated_teams } = tourney_teams.value;

const { isAdmin } = storeToRefs(useUserStore());

const edit_mode = ref(false);

const max_score = computed(() => {
  if (match.bo_type === BestofType.RANKING) {
    return match.teams.length;
  }

  return match.bo_type as number;
});

const match_info = reactive({
  bo_type: match.bo_type,
  teams: match.teams.concat(Array(team_per_match.value - match.teams.length).fill(0)),
  status: match.status,
  score: validated_teams.reduce((acc, team) => {
    if (Object.keys(match.score).includes(team.id.toString())) {
      acc[team.id] = match.score[team.id];
    } else {
      acc[team.id] = 0;
    }
    return acc;
  }, { 0: 0 } as Record<number, number>),
  play_all: match.play_all,
});
const match_info_rules = computed(() => ({
  bo_type: { required },
  teams: { required, minLength: minLength(0), maxLength: maxLength(team_per_match) },
  status: { required },
  score: Object.entries(match_info.score).reduce((res, team) => {
    res[Number(team[0])] = {
      required,
      between: between(0, max_score),
    };
    return res;
  }, {} as Record<number, { required: ValidationRule; between: ValidationRule }>),
  play_all: { required },
}));

const reset = () => {
  match_info.bo_type = match.bo_type;
  match_info.teams = match.teams.concat(Array(team_per_match.value - match.teams.length).fill(0));
  match_info.status = match.status;
  match_info.score = validated_teams.reduce((acc, team) => {
    if (Object.keys(match.score).includes(team.id.toString())) {
      acc[team.id] = match.score[team.id];
    } else {
      acc[team.id] = 0;
    }
    return acc;
  }, { 0: 0 } as Record<number, number>);
  match_info.play_all = match.play_all;
};

const edit_bo_type = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (value > 0 && value % 2 === 0) {
    match_info.bo_type = value + 1;
    match_info.play_all = true;
  } else {
    match_info.bo_type = value;
    match_info.play_all = false;
  }
};

const v$ = useVuelidate(match_info_rules, match_info);

const patch_match = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  const match_info_clean = { ...match_info };

  match_info_clean.teams = match_info_clean.teams.filter((team_id) => team_id !== 0);
  match_info_clean.score = Object.fromEntries(
    Object.entries(match_info_clean.score)
      .filter(([team_id]) => match_info_clean.teams.includes(Number(team_id))),
  );

  const score_sum = Object.values(match_info_clean.score).reduce((a, b) => a + b, 0);
  const n = match_info_clean.teams.length;
  if (
    match_info_clean.status === MatchStatus.COMPLETED
    && (
      (match.bo_type === BestofType.RANKING && score_sum !== (n * (n + 1)) / 2)
      || (match.bo_type !== BestofType.RANKING && score_sum > (match.bo_type as number))
    )
  ) {
    addNotification(t('content.components.Tournament.MatchCard.invalidScores'), 'error');
    return;
  }

  await patchMatch(match_info_clean, match.id, matchType);

  addNotification(t('content.components.Tournament.MatchCard.matchUpdated'), 'info');
  edit_mode.value = false;
};

const select_match = <M extends GroupMatch | KnockoutMatch | SwissMatch>(m: M) => {
  if (!isAdmin || !selectable || edit_mode.value || m.teams.length === 0) return;

  if (m.status === MatchStatus.SCHEDULED) {
    if (selected_matchs.value?.has(m.id)) {
      selected_matchs.value.delete(m.id);
    } else {
      selected_matchs.value?.add(m.id);
    }
  }
};

const open_edition = () => {
  if (editable) {
    reset();
    edit_mode.value = true;
  }
};
</script>

<template>
  <div
    class="u-full-width c-card-bg-2 l-flex-column l-cross-center l-gap-1"
    :class="{
      'c-highlighted': selectable && selected,
      'hover-bg-3': match.status === MatchStatus.SCHEDULED && selectable && !edit_mode,
    }"
    @click="select_match(match)"
    @keypress="select_match(match)"
  >
    <div
      class="l-flex-row c-card-bg-3 u-py-1 u-px-2 l-cross-center"
    >
      <div
        v-if="!edit_mode"
      >
        {{ match.bo_type === BestofType.RANKING ? t('content.components.Tournament.MatchCard.classification') : (match.play_all ? t('content.components.Tournament.MatchCard.playAll', { value: match.bo_type }) : t('content.components.Tournament.MatchCard.bestOf', { value: match.bo_type })) }}
      </div>
      <select
        v-else
        id="bo_type"
        name="bo_type"
        :value="(match.bo_type as number) - (match.play_all ? 1 : 0)"
        @change.stop="edit_bo_type"
      >
        <option
          v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
          :key="value"
          :value="value"
        >
          {{ value === '0' ? t('content.components.Tournament.MatchCard.classification') : t('content.components.Tournament.MatchCard.bestOf', { value }) }}
        </option>
        <option
          v-for="value in Object.keys(BestofType).map(Number).filter((v) => Number.isInteger(v) && v > 1)"
          :key="value - 1"
          :value="value - 1"
        >
          {{ t('content.components.Tournament.MatchCard.playAll', { value }) }}
        </option>
      </select>

      <div
        v-if="!edit_mode"
        class="u-color-text-2"
      >
        <span v-if="match.status === MatchStatus.SCHEDULED">
          <fa-awesome-icon
            class="c-inline-icon u-ml-0"
            icon="fa-clock"
          />
          {{ t('content.components.Tournament.MatchCard.scheduled') }}
        </span>
        <span v-else-if="match.status === MatchStatus.ONGOING">
          <fa-awesome-icon
            class="c-inline-icon u-ml-0"
            icon="fa-arrows-rotate"
          />
          {{ t('content.components.Tournament.MatchCard.ongoing') }}
        </span>
        <span v-else>
          <fa-awesome-icon
            class="c-inline-icon u-ml-0"
            icon="fa-circle-check"
          />
          {{ t('content.components.Tournament.MatchCard.completed') }}
        </span>
      </div>
      <select
        v-else
        id="match_status"
        v-model="match_info.status"
        name="match_status"
      >
        <option
          v-for="match_status in MatchStatus"
          :key="match_status"
          :value="match_status"
        >
          {{
            match_status === MatchStatus.SCHEDULED
              ? t('content.components.Tournament.MatchCard.scheduled')
              : match_status === MatchStatus.ONGOING
                ? t('content.components.Tournament.MatchCard.ongoing')
                : t('content.components.Tournament.MatchCard.completed')
          }}
        </option>
      </select>

      <div
        v-if="isAdmin && editable"
      >
        <button
          v-if="!edit_mode"
          type="button"
          :title="t('content.components.Tournament.MatchCard.editMatch')"
          @click.stop="open_edition"
        >
          <fa-awesome-icon
            class="c-image-btn c-inline-icon u-m-0"
            icon="fa-pencil"
          />
        </button>
        <div
          v-else
          class="l-flex-row l-cross-center l-gap-1 u-big-text"
        >
          <button
            type="button"
            :title="t('content.components.Tournament.MatchCard.save')"
            @click.stop="patch_match"
          >
            <fa-awesome-icon
              class="c-image-btn c-inline-icon u-m-0"
              icon="fa-save"
            />
          </button>
          <button
            type="button"
            :title="t('content.components.Tournament.MatchCard.cancelChanges')"
            @click.stop="edit_mode = false; reset()"
          >
            <fa-awesome-icon
              class="c-image-btn c-inline-icon u-m-0"
              icon="fa-xmark"
            />
          </button>
        </div>
      </div>
    </div>

    <div v-if="!edit_mode" class="u-full-width">
      <div
        v-for="idx in (match.status !== MatchStatus.SCHEDULED ? match.teams.length : team_per_match)"
        :key="idx"
        class="l-flex-row u-full-width l-gap-2 l-overflow-auto"
        :class="{ 'u-color-correct-1': is_winning_team(match, match.teams[idx - 1]) }"
      >
        <div>
          {{ get_validated_team_by_id(match.teams[idx - 1])?.name ?? t('content.components.Tournament.MatchCard.tbd') }}
        </div>
        <div class="l-grow"/>
        <div>
          {{ match.score[match.teams[idx - 1]] ?? 0 }}
        </div>
      </div>
    </div>
    <div v-else class="l-flex-column l-gap-1">
      <FormField
        v-for="idx in team_per_match"
        :key="idx"
        :validations="v$.score[match_info.teams[idx - 1]]"
      >
        <div
          class="l-flex-row l-gap-1"
        >
          <select
            id="select_team"
            v-model="match_info.teams[idx - 1]"
            name="select_team"
            @click.stop
          >
            <option
              v-for="team in validated_teams.filter(
                (t: Team) => t.id === match_info.teams[idx - 1] || !match_info.teams.includes(t.id),
              )"
              :key="team.id"
              :value="team.id"
            >
              {{ team.name }}
            </option>
            <option :value="0">
              {{ t('content.components.Tournament.MatchCard.tbd') }}
            </option>
          </select>

          <input
            id="score"
            v-model.number="match_info.score[match_info.teams[idx - 1]]"
            type="number"
            name="score"
            @blur="v$.score[match_info.teams[idx - 1]].$touch"
          />
        </div>
      </FormField>
    </div>
  </div>
</template>

<style scoped>
.hover-bg-3:hover {
  background-color: var(--color-bg-3);
}
</style>
