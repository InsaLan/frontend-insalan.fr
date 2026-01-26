<script setup lang="ts">
import { computed, ref } from 'vue';
import Bracket from '@/components/Tournament/Bracket.vue';
import GroupDetail from '@/components/Tournament/GroupDetail.vue';
import GroupTable from '@/components/Tournament/GroupTable.vue';
import SwissRoundTable from '@/components/Tournament/SwissRoundTable.vue';
import type { Group } from '@/models/group';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();

const selected_stage = ref(tournament.stages.at(0)?.id ?? 0);

const brackets = computed(() => tournament.brackets.filter((b) => b.stage === selected_stage.value));
const groups = computed(() => tournament.groups.filter((b) => b.stage === selected_stage.value));
const swiss_rounds = computed(() => tournament.swissRounds.filter((b) => b.stage === selected_stage.value));

const group_detail = ref<Group | undefined>(undefined);
</script>

<template>
  <section
    id="stages"
    class="my-3"
    :class="{ 'flex flex-1 items-center justify-center': tournament.stages.length === 0 }"
  >
    <h1
      v-if="tournament.stages.length === 0"
      class="text-2xl"
    >
      Les phases du tournoi ne sont pas encore disponibles.
    </h1>

    <div v-else>
      <div class="mb-3 flex flex-wrap justify-center gap-x-8 gap-y-2">
        <button
          v-for="stage in tournament.stages"
          :key="stage.id"
          type="button"
          class="rounded-lg bg-cyan-900 p-2 transition duration-150 ease-in-out hover:ring-2 hover:ring-[#63d1ff]"
          :class="{ 'ring-2 ring-[#63d1ff]': stage.id === selected_stage }"
          @click="selected_stage = stage.id"
        >
          {{ stage.name }}
        </button>
      </div>

      <hr class="m-auto w-4/5">

      <section
        v-if="groups.length !== 0"
        id="groups"
      >
        <div
          v-if="group_detail === undefined"
          class="m-4 flex flex-wrap justify-center gap-6 lg:gap-8 2xl:gap-10"
        >
          <button
            v-for="group in groups"
            :key="group.id"
            class="flex hover:cursor-pointer hover:rounded hover:ring-4 hover:ring-[#63d1ff]"
            type="button"
            @click="group_detail = group"
          >
            <GroupTable
              :group="group"
              class="w-[27rem] shrink"
            />
          </button>
        </div>
        <div
          v-else
          class="flex flex-col gap-5 p-4 lg:gap-8 lg:p-8"
        >
          <nav class="flex justify-center gap-3">
            <button type="button" class="justify-center rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500" @click="group_detail = undefined">
              <fa-awesome-icon icon="fa-solid fa-arrow-left"/> Retour
            </button>
            <h1 class="text-center text-3xl font-black">
              {{ group_detail.name }}
            </h1>
          </nav>
          <GroupDetail
            :group="group_detail"
          />
        </div>
      </section>

      <section
        v-if="swiss_rounds.length !== 0"
        id="swiss_rounds"
      >
        <SwissRoundTable
          v-for="swiss in swiss_rounds"
          :key="swiss.id"
          :swiss="swiss"
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
        />
      </section>
    </div>
  </section>
</template>
