<script setup lang="ts">
import type { KnockoutMatch } from '@/models/bracket';
import type { GroupMatch } from '@/models/group';
import type { SwissMatch } from '@/models/swiss';
import { useTournamentStore } from '@/stores/tournament.store';

const { is_winning_team, get_validated_team_by_id } = useTournamentStore();

defineProps<{
  teamPerMatch: number;
  match: GroupMatch | KnockoutMatch | SwissMatch;
  // teams: Record<string, string | number | boolean | undefined>[];
  // status: string;
}>();
</script>

<template>
  <div
    v-for="idx in teamPerMatch"
    :key="idx"
    class="flex items-center justify-between bg-slate-700 p-2 text-xl"
    :class="{ 'bg-slate-900': match.status === 'ONGOING' }"
  >
    <div
      class="text-grey-500 truncate"
    >
      {{ get_validated_team_by_id(match.teams[idx - 1])?.name ?? "TBD" }}
    </div>
    <div
      v-if="match.status === 'COMPLETED'"
      :class="is_winning_team(match, match.teams[idx - 1]) ? 'text-emerald-300' : 'text-white'"
      class="text-2xl font-black"
    >
      {{ match.score[match.teams[idx - 1]] ?? 0 }}
    </div>
    <div
      v-else
      class="text-2xl font-black"
    >
      0
    </div>
  </div>
</template>
