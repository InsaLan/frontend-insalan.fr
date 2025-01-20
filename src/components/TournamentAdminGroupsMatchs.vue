<script setup lang="ts">
import { computed, ref } from 'vue';
import { type Match, MatchStatus } from '@/models/match';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const {
  get_validated_team_by_id,
  get_matchs_per_round,
} = tournamentStore;

const max_round = computed(() => Math.max(...tournament.groups.map((group) => group.round_count)));

const selected_matchs = ref(new Set<number>());
const select_match = (match: Match) => {
  if (match.status === MatchStatus.SCHEDULED) {
    if (selected_matchs.value.has(match.id)) {
      selected_matchs.value.delete(match.id);
    } else {
      selected_matchs.value.add(match.id);
    }
  }
};
</script>

<template>
  <div
    class="flex justify-center gap-8"
  >
    <router-link :to="{ name: 'tournament_admin_groups' }">
      Gérer les poules
    </router-link>
    <button
      type="button"
    >
      Lancer les matchs
    </button>
  </div>

  <div class="m-2 overflow-auto md:m-4 xl:m-8">
    <table
      class="w-full table-fixed"
    >
      <tr class="border-b-2">
        <th class="w-32 border-r-2 p-2">
          Poule
        </th>
        <th
          v-for="round in max_round"
          :key="round"
          :class="{ 'border-r': round < max_round }"
          class="w-56 lg:w-[34rem]"
        >
          Tour {{ round }}
        </th>
      </tr>
      <tr
        v-for="group in tournament.groups"
        :key="group.id"
        class="border-b"
      >
        <td class="border-r-2 text-center">
          {{ group.name }}
        </td>
        <td
          v-for="matchs in get_matchs_per_round(group.matchs).reverse()"
          :key="matchs[0].round_number"
          :class="{ 'border-r': matchs[0].round_number < max_round }"
          class=""
        >
          <div class="flex flex-wrap justify-around gap-2 p-2">
            <table
              v-for="match in matchs"
              :key="match.id"
              class="border-separate rounded border px-2 pb-2"
              :class="[
                selected_matchs.has(match.id)
                  ? 'border-4 border-blue-800'
                  : 'm-[3px]',
                match.status === MatchStatus.SCHEDULED && !selected_matchs.has(match.id)
                  ? 'hover:m-[2px] hover:border-2 hover:border-blue-800'
                  : '',
              ]"
              @click="select_match(match)"
              @keypress="select_match(match)"
            >
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
                v-for="team_id in match.teams"
                :key="team_id"
              >
                <td
                  class="w-52 truncate"
                >
                  {{ get_validated_team_by_id(team_id)?.name }}
                </td>
                <td
                  class="w-6 text-right"
                >
                  {{ group.scores[team_id] }}
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
