<script setup lang="ts">
import GroupTable from '@/components/Tournament/GroupTable.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import type { Group } from '@/models/group';
import { MatchTypeEnum } from '@/models/match';
import { useTournamentStore } from '@/stores/tournament.store';

const { group } = defineProps<{
  group: Group;
}>();

const { get_matchs_per_round } = useTournamentStore();
</script>

<template>
  <section
    id="group_detail"
  >
    <div class="flex flex-col justify-center gap-10 lg:flex-row lg:gap-3">
      <div class="flex lg:w-1/2">
        <GroupTable
          :group="group"
          class="h-min grow"
        />
      </div>
      <div
        class="flex flex-col lg:w-1/2"
      >
        <div
          v-for="matchs in get_matchs_per_round(group.matchs ?? []).reverse()"
          :key="matchs[0].id"
        >
          <h1 class="text-center text-3xl font-black">
            Tour {{ matchs[0].round_number }}
          </h1>
          <div
            class="flex flex-wrap items-center justify-center"
          >
            <MatchCard
              v-for="match in matchs"
              :key="match.id"
              :match="match"
              :match-type="{ type: MatchTypeEnum.GROUP, id: match.group }"
              class="w-[21rem] shrink"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
