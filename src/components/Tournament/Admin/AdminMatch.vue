<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import {
  computed,
  reactive,
  ref,
} from 'vue';
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

const selected_matchs = defineModel<Set<number>>();
const selected = computed(() => selected_matchs.value?.has(match.id));

const { addNotification } = useNotificationStore();

const { get_validated_team_by_id, is_winning_team, patchMatch } = useTournamentStore();
const { validated_teams } = storeToRefs(useTournamentStore()).tourney_teams.value;

const { user } = storeToRefs(useUserStore());
const is_admin = computed(() => user.value.is_staff || user.value.is_superuser);

const edit_mode = ref(false);

const match_info = reactive({
  bo_type: match.bo_type,
  teams: match.teams.concat(Array(teamPerMatch - match.teams.length).fill(0)),
  status: match.status,
});
const match_info_rules = computed(() => ({
  bo_type: { required },
  teams: { required, minLength: minLength(0), maxLength: maxLength(teamPerMatch) },
  status: { required },
}));

const v$ = useVuelidate(match_info_rules, match_info);

const patch_match = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  match_info.teams = match_info.teams.filter((t) => t !== 0);

  await patchMatch(match_info, match.id, matchType);

  addNotification('Le match a bien été modifié.', 'info');
  edit_mode.value = false;
};

const select_match = <M extends GroupMatch | KnockoutMatch | SwissMatch>(m: M) => {
  if (!selectable || edit_mode.value || m.teams.length === 0) return;

  if (m.status === MatchStatus.SCHEDULED) {
    if (selected_matchs.value?.has(m.id)) {
      selected_matchs.value.delete(m.id);
    } else {
      selected_matchs.value?.add(m.id);
    }
  }
};
</script>

<template>
  <table
    class="border-separate rounded border px-2 pb-2"
    :class="[
      selected
        ? 'border-4 border-blue-800'
        : 'm-[3px] border-white',
      match.status === MatchStatus.SCHEDULED && !selected && selectable && !edit_mode
        ? 'hover:m-[2px] hover:border-2 hover:border-blue-800'
        : '',
    ]"
    @click="select_match(match)"
    @keypress="select_match(match)"
  >
    <thead>
      <tr>
        <th
          colspan="2"
          class="border-b-2"
        >
          <div
            class="grid w-full grid-cols-[1fr,2fr,1fr] items-center"
          >
            <span
              v-if="!edit_mode"
              class="text-left"
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
                class="bg-inherit"
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
            >
              <select
                id="match_status"
                v-model="match_info.status"
                name="match_status"
                class="bg-inherit"
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
              v-if="is_admin && editable && match.status === MatchStatus.SCHEDULED"
              class="flex items-center justify-end"
            >
              <fa-awesome-icon
                v-if="!edit_mode"
                class="hover:cursor-pointer"
                icon="fa-solid fa-pencil"
                size="xs"
                title="Edit match"
                @click.stop="if (editable) edit_mode = true;"
              />

              <div
                v-else
              >
                <fa-awesome-icon
                  class="pr-2 text-green-500 hover:cursor-pointer"
                  icon="fa-solid fa-save"
                  size="lg"
                  title="Save changer"
                  @click.stop="patch_match"
                />
                <fa-awesome-icon
                  class="text-red-500 hover:cursor-pointer"
                  icon="fa-solid fa-xmark"
                  size="xl"
                  title="Cancel"
                  @click.stop="edit_mode = false"
                />
              </div>
            </div>
          </div>
        </th>
      </tr>
    </thead>
    <tbody v-if="!edit_mode">
      <tr
        v-for="idx in (match.status !== MatchStatus.SCHEDULED ? match.teams.length : teamPerMatch)"
        :key="idx"
      >
        <td>
          <div
            class="w-52 truncate"
            :class="{ 'text-green-500': is_winning_team(match, match.teams[idx - 1]) }"
          >
            {{ get_validated_team_by_id(match.teams[idx - 1])?.name ?? 'TBD' }}
          </div>
        </td>
        <td
          class="w-6 text-right"
          :class="{ 'text-green-500': is_winning_team(match, match.teams[idx - 1]) }"
        >
          {{ match.score[match.teams[idx - 1]] ?? 0 }}
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr
        v-for="idx in teamPerMatch"
        :key="idx"
      >
        <td>
          <select
            id="select_team"
            v-model="match_info.teams[idx - 1]"
            name="select_team"
            class="w-52 truncate bg-inherit"
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
        </td>
        <td
          class="w-6 text-right"
        >
          0
        </td>
      </tr>
    </tbody>
  </table>
</template>
