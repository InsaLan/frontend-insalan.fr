<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import GroupTable from '@/components/Tournament/GroupTable.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import type { Group } from '@/models/group';
import { MatchTypeEnum } from '@/models/match';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();

const tournament = toRef(props, 'tournament');
const groups = tournament.value?.groups;

const show_group_details = ref<number>(0);

const tournamentStore = useTournamentStore();
const {
  getTournamentTeams,
  get_group_by_id,
  get_matchs_per_round,
} = tournamentStore;

getTournamentTeams();

const group_details = computed<Group | undefined>(() => get_group_by_id(groups || [], show_group_details.value));
</script>

<template>
  <section
    id="groups"
    :class="{ hidden: show_group_details !== 0 }"
  >
    <h1
      v-if="groups?.length === 0"
      class="mt-6 flex l-items-main-center text-center text-4xl"
    >
      Les poules ne sont pas disponibles.
    </h1>
    <div
      v-else
      class="m-4 flex flex-wrap l-items-main-center gap-6 md:m-6 lg:m-8 lg:gap-8 2xl:m-9 2xl:gap-10"
    >
      <GroupTable
        v-for="group in tournament.groups"
        :key="group.id"
        :group="group"
        class="w-[27rem] shrink hover:cursor-pointer hover:rounded hover:ring-4 hover:ring-[#63d1ff]"
        @click="show_group_details = group.id"
        @keydown.enter="show_group_details = group.id"
      />
    </div>
  </section>

  <section
    v-if="group_details !== undefined"
    id="group"
    :class="{ hidden: show_group_details === 0 }"
    class="l-flex-column gap-5 p-4 lg:gap-8 lg:p-8"
  >
    <nav class="flex l-items-main-center gap-3">
      <button type="button" class="l-items-main-center rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500" @click="show_group_details = 0">
        <fa-awesome-icon icon="fa-solid fa-arrow-left"/> Retour
      </button>
      <h1 class="text-center text-3xl font-black">
        {{ group_details?.name }}
      </h1>
    </nav>
    <div class="l-flex-column l-items-main-center gap-10 lg:flex-row lg:gap-3">
      <div class="flex lg:w-1/2">
        <GroupTable
          :group="group_details"
          class="h-min grow"
        />
      </div>
      <div
        class="l-flex-column lg:w-1/2"
      >
        <div
          v-for="matchs in get_matchs_per_round(group_details?.matchs ?? []).reverse()"
          :key="matchs[0].id"
        >
          <h1 class="text-center text-3xl font-black">
            Tour {{ matchs[0].round_number }}
          </h1>
          <div
            class="flex flex-wrap l-items-cross-center l-items-main-center"
          >
            <MatchCard
              v-for="match in matchs"
              :key="match.id"
              :match="match"
              :match-type="{ type: MatchTypeEnum.GROUP, id: match.group }"
              :team-per-match="tournament.game.team_per_match"
              class="w-[23rem] shrink"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
