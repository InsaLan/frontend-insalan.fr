<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed,
  reactive,
  ref,
} from 'vue';
import FormField from '@/components/FormField.vue';
import type { KnockoutMatch } from '@/models/bracket';
import type { GroupMatch } from '@/models/group';
import {
  BestofType,
  MatchStatus,
  type MatchType,
} from '@/models/match';
import type { SwissMatch } from '@/models/swiss';
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
  teamPerMatch,
  editable = false,
  selectable = false,
} = defineProps<{
  match: GroupMatch | KnockoutMatch | SwissMatch;
  matchType: MatchType;
  teamPerMatch: number;
  editable?: boolean;
  selectable?: boolean;
}>();

const selected_matchs = defineModel<Set<number>>({ default: new Set() });
const selected = computed(() => selected_matchs.value?.has(match.id));

const { addNotification } = useNotificationStore();

const { get_validated_team_by_id, is_winning_team, patchMatch } = useTournamentStore();
const { validated_teams } = storeToRefs(useTournamentStore()).tourney_teams.value;

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
  teams: match.teams.concat(Array(teamPerMatch - match.teams.length).fill(0)),
  status: match.status,
  score: validated_teams.reduce((acc, team) => {
    if (Object.keys(match.score).includes(team.id.toString())) {
      acc[team.id] = match.score[team.id];
    } else {
      acc[team.id] = 0;
    }
    return acc;
  }, { 0: 0 } as Record<number, number>),
});
const match_info_rules = computed(() => ({
  bo_type: { required },
  teams: { required, minLength: minLength(0), maxLength: maxLength(teamPerMatch) },
  status: { required },
  score: Object.entries(match_info.score).reduce((res, team) => {
    res[Number(team[0])] = {
      required,
      between: between(0, max_score),
    };
    return res;
  }, {} as Record<number, { required: ValidationRule; between: ValidationRule }>),
}));

const reset = () => {
  match_info.bo_type = match.bo_type;
  match_info.teams = match.teams.concat(Array(teamPerMatch - match.teams.length).fill(0));
  match_info.status = match.status;
  match_info.score = validated_teams.reduce((acc, team) => {
    if (Object.keys(match.score).includes(team.id.toString())) {
      acc[team.id] = match.score[team.id];
    } else {
      acc[team.id] = 0;
    }
    return acc;
  }, { 0: 0 } as Record<number, number>);
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
    addNotification('Les scores que vous avez rentrés ne sont pas valide !', 'error');
    return;
  }

  await patchMatch(match_info_clean, match.id, matchType);

  addNotification('Le match a bien été modifié.', 'info');
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
    class="m-2 min-w-0 rounded bg-cyan-900 px-2 py-1 font-black shadow-lg"
    :class="{
      'ring-4 ring-[#63d1ff]': selected,
      'hover:ring-2 hover:ring-[#63d1ff]': match.status === MatchStatus.SCHEDULED && !selected && selectable && !edit_mode,
    }"
    style="text-shadow: black 0 0 2px;"
    @click="select_match(match)"
    @keypress="select_match(match)"
  >
    <div
      class="mb-1 grid grid-cols-[1fr,2fr,1fr] border-b-2"
    >
      <span
        v-if="!edit_mode"
      >
        {{ match.bo_type === BestofType.RANKING ? 'Cls' : `BO ${match.bo_type}` }}
      </span>
      <span
        v-else
      >
        <select
          id="bo_type"
          v-model="match_info.bo_type"
          name="bo_type"
          class="bg-inherit py-1 pl-1"
          @click.stop
        >
          <option
            v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
            :key="value"
            :value="value"
          >
            {{ value === '0' ? 'Cls' : `BO ${value}` }}
          </option>
        </select>
      </span>

      <div
        v-if="!edit_mode"
        class="text-center"
      >
        <span v-if="match.status === MatchStatus.SCHEDULED" class="text-center text-blue-500">
          <fa-awesome-icon
            icon="fa-solid fa-clock"
          />
          Prévu
        </span>
        <span v-else-if="match.status === MatchStatus.ONGOING" class="text-center text-orange-500">
          <fa-awesome-icon
            icon="fa-solid fa-arrows-rotate"
          />
          En cours
        </span>
        <span v-else class="text-center text-green-500">
          <fa-awesome-icon
            icon="fa-solid fa-check"
          />
          Terminé
        </span>
      </div>
      <div
        v-else
        class="text-center"
      >
        <select
          id="match_status"
          v-model="match_info.status"
          name="match_status"
          class="bg-inherit py-1 pl-1"
        >
          <option
            v-for="match_status in MatchStatus"
            :key="match_status"
            :value="match_status"
          >
            {{
              match_status === MatchStatus.SCHEDULED
                ? 'Prévu'
                : match_status === MatchStatus.ONGOING
                  ? 'En cours'
                  : 'Terminé'
            }}
          </option>
        </select>
      </div>

      <div
        v-if="isAdmin && editable"
        class="flex l-items-cross-center justify-end"
      >
        <fa-awesome-icon
          v-if="!edit_mode"
          class="hover:cursor-pointer hover:text-gray-500"
          icon="fa-solid fa-pencil"
          size="sm"
          title="Éditer le match"
          @click.stop="open_edition"
        />

        <div
          v-else
          class="flex l-items-cross-center gap-2"
        >
          <fa-awesome-icon
            class="text-green-500 hover:cursor-pointer hover:text-green-700"
            icon="fa-solid fa-save"
            size="lg"
            title="Sauvegarder"
            @click.stop="patch_match"
          />
          <fa-awesome-icon
            class="text-red-500 hover:cursor-pointer hover:text-red-700"
            icon="fa-solid fa-xmark"
            size="xl"
            title="Annuler"
            @click.stop="edit_mode = false; reset()"
          />
        </div>
      </div>
    </div>
    <div v-if="!edit_mode">
      <div
        v-for="idx in (match.status !== MatchStatus.SCHEDULED ? match.teams.length : teamPerMatch)"
        :key="idx"
        class="flex justify-between gap-3"
        :class="{ 'text-green-500': is_winning_team(match, match.teams[idx - 1]) }"
      >
        <div
          class="truncate"
        >
          {{ get_validated_team_by_id(match.teams[idx - 1])?.name ?? 'TBD' }}
        </div>
        <div
          class="text-right"
        >
          {{ match.score[match.teams[idx - 1]] ?? 0 }}
        </div>
      </div>
    </div>
    <div v-else>
      <FormField
        v-for="idx in teamPerMatch"
        :key="idx"
        v-slot="context"
        :validations="v$.score[match_info.teams[idx - 1]]"
        class="l-flex-column"
      >
        <div
          class="flex justify-between"
        >
          <select
            id="select_team"
            v-model="match_info.teams[idx - 1]"
            name="select_team"
            class="grow truncate bg-inherit py-1 pl-1"
            @click.stop
          >
            <option
              v-for="team in validated_teams.filter(
                (t) => t.id === match_info.teams[idx - 1] || !match_info.teams.includes(t.id),
              )"
              :key="team.id"
              :value="team.id"
            >
              {{ team.name }}
            </option>
            <option :value="0">
              TBD
            </option>
          </select>

          <input
            id="score"
            v-model.number="match_info.score[match_info.teams[idx - 1]]"
            type="number"
            name="score"
            :class="{ error: context.invalid }"
            class="w-10 bg-inherit p-1 text-right"
            @blur="v$.score[match_info.teams[idx - 1]].$touch"
          />
        </div>
      </FormField>
    </div>
  </div>
</template>

<style>
input[type="number"] {
  appearance: textfield;
}
</style>
