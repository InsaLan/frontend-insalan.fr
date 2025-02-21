<script setup lang="ts">
import { computed } from 'vue';
import KnockoutMatchCard from '@/components/Tournament/KnockoutMatchCard.vue';
import type { SwissRound } from '@/models/swiss';
import { groupBy } from '@/stores/tournament.store';

const { swiss, teamPerMatch } = defineProps<{
  // rounds: Record<string, Record<string, string | Record<string, string | number | boolean | undefined>[]>[]>;
  swiss: SwissRound;
  teamPerMatch: number;
}>();

const roundCount = computed(() => 2 * swiss.min_score - 1);
</script>

<template>
  <div class="grid size-full gap-x-10 gap-y-5" :style="{ 'grid-template-columns': `repeat(${roundCount}, minmax(18rem, 1fr))` }">
    <h1
      v-for="round_idx in roundCount"
      :key="round_idx"
      class="text-center text-3xl"
    >
      Tour {{ round_idx }}
    </h1>
    <div
      v-for="(round_matchs, round_idx) in groupBy(swiss.matchs, 'round_number')"
      :key="round_idx"
      class="flex flex-col gap-6"
    >
      <div
        v-for="(matchs, score_group) in groupBy(round_matchs, 'score_group')"
        :key="score_group"
        class="border-2 border-gray-500"
      >
        <div
          class="bg-gray-500 text-center"
        >
          <div
            v-if="Number(round_idx) <= swiss.min_score"
          >
            {{ Number(round_idx) - 1 - Number(score_group) }} - {{ score_group }}
          </div>
          <div v-else>
            {{ swiss.min_score - 1 - Number(score_group) }} -
            {{ Number(round_idx) - swiss.min_score + Number(score_group) }}
          </div>
        </div>

        <div
          class="flex flex-col items-center gap-3"
        >
          <div
            v-for="match in matchs"
            :key="match.id"
            class="my-3 w-full divide-y px-2"
          >
            <KnockoutMatchCard
              :match="match"
              :team-per-match="teamPerMatch"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- <div v-for="round_idx in roundCount" :key="round_idx" class="flex flex-col">
      <div v-for="(match, idx) in rounds[round_idx]" :key="idx" class="my-3 divide-y">
        <KnockoutMatchCard
          :team-per-match="teamPerMatch"
          :match="match"
        />
      </div>
    </div> -->
  </div>
</template>
