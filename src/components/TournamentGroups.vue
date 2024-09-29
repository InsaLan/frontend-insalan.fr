<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, toRef } from 'vue';
import GroupTable from '@/components/GroupTable.vue';
import type { Group } from '@/models/group';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

const tournament = toRef(props, 'tournament');
const groups = tournament.value?.groups;

const show_group_details = ref<number>(0);

const tournamentStore = useTournamentStore();
const {
  getTournamentTeams,
  get_group_by_id,
  get_matchs_per_round,
  get_validated_team_by_id,
} = tournamentStore;

getTournamentTeams();

const group_details = computed<Group | undefined>(() => get_group_by_id(groups || [], show_group_details.value));

const { tourney_teams } = storeToRefs(tournamentStore);
</script>

<template>
  <section
    id="groups"
    :class="{ hidden: show_group_details !== 0 }"
  >
    <h1
      v-if="groups?.length === 0"
      class="mt-6 flex justify-center text-center text-4xl"
    >
      Les poules ne sont pas disponibles.
    </h1>
    <div
      v-else
      class="my-10 flex flex-1 flex-wrap justify-center gap-20"
    >
      <div
        v-for="group in groups"
        :key="group.id"
        class="m-2 border-collapse border-slate-500 hover:ring-8 hover:ring-slate-500 lg:m-0 lg:w-2/5"
        @click="show_group_details = group.id"
        @keydown.enter="show_group_details = group.id"
      >
        <GroupTable
          :teams="tourney_teams"
          :group="group"
        />
      </div>
    </div>
  </section>

  <section v-if="group_details !== undefined" id="group" :class="{ hidden: show_group_details === 0 }" class="flex flex-col p-4">
    <nav class="my-5 flex justify-center gap-3">
      <button type="button" class="w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto" @click="show_group_details = 0">
        <fa-awesome-icon icon="fa-solid fa-arrow-left"/> Retour
      </button>
      <h1 class="text-center text-3xl font-black">
        {{ group_details?.name }}
      </h1>
    </nav>
    <div class="flex flex-col justify-center gap-10 md:flex-row md:gap-3">
      <div class="max-h-96 md:ml-10 md:w-1/2">
        <GroupTable
          :teams="tourney_teams"
          :group="group_details"
        />
      </div>
      <div class="flex flex-col-reverse md:w-1/2">
        <div
          v-for="matchs in get_matchs_per_round(group_details?.matchs ?? [])"
          :key="matchs[0].id"
        >
          <h1 class="text-center text-3xl font-black">
            Round {{ matchs[0].round_number }}
          </h1>
          <div class="gap-4">
            <div v-for="game in matchs" :key="game.id">
              <div v-if="game.teams.length == 2" class="flex justify-center">
                <div class="mb-4 flex flex-1 justify-between divide-x overflow-hidden border-2 text-xl font-bold md:ml-10">
                  <div class="w-full truncate p-3">
                    {{ get_validated_team_by_id(game.teams[0])?.name || "TBD" }}
                  </div>
                  <div class="p-3">
                    {{ game.score[game.teams[0]] }}
                  </div>
                </div>
                <div class="mb-4 flex flex-1 divide-x overflow-hidden border-2 text-xl font-bold md:mr-10">
                  <div class="p-3">
                    {{ game.score[game.teams[1]] }}
                  </div>
                  <div class="w-full truncate p-3 text-right">
                    {{ get_validated_team_by_id(game.teams[1])?.name || "TBD" }}
                  </div>
                </div>
              </div>
              <div v-else class="flex justify-center">
                <div>
                  <div class="mx-5 mb-4 flex flex-1 justify-between divide-x border-2 text-xl font-bold">
                    <table>
                      <tr>
                        <th align="center" class="troncate border-separate border border-slate-500 bg-slate-200 p-4 text-black">
                          Equipe
                        </th>
                        <th align="center" class="border-separate border border-slate-500 bg-slate-200 p-4 text-black">
                          Score
                        </th>
                      </tr>
                      <tr v-for="team_id in game.teams" :key="team_id">
                        <td align="center" class="border-separate border border-slate-500 p-4">
                          {{ get_validated_team_by_id(team_id)?.name || "TBD" }}
                        </td>
                        <td align="center" class="border-separate border border-slate-500 p-4">
                          {{ game.score[team_id] }}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
