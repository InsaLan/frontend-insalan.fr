<script setup lang="ts">
import { type Match, MatchStatus } from '@/models/match';
import { useTournamentStore } from '@/stores/tournament.store';

const { match, selected, teamPerMatch } = defineProps<{
  match: Match;
  selected: boolean;
  teamPerMatch: number;
}>();

const { get_validated_team_by_id } = useTournamentStore();

</script>

<template>
  <table
    class="border-separate rounded border px-2 pb-2"
    :class="[
      selected
        ? 'border-4 border-blue-800'
        : 'm-[3px] border-white',
      match.status === MatchStatus.SCHEDULED && !selected
        ? 'hover:m-[2px] hover:border-2 hover:border-blue-800'
        : '',
    ]"
  >
    <tbody>
      <tr>
        <th
          colspan="2"
          class="border-b-2"
        >
          <div
            class="grid w-full grid-cols-[1fr,2fr,1fr]"
          >
            <span class="text-left">BO {{ match.bo_type }}</span>

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
        </th>
      </tr>
      <tr
        v-for="idx in (match.status === MatchStatus.ONGOING ? match.teams.length : teamPerMatch)"
        :key="idx"
      >
        <td
          class="w-52 truncate"
        >
          {{ get_validated_team_by_id(match.teams[idx - 1])?.name ?? 'TBD' }}
        </td>
        <td
          class="w-6 text-right"
        >
          {{ match.score[idx - 1] ?? 0 }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
