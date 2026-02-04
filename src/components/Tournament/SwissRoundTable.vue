<script setup lang="ts">
import { computed } from 'vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import { MatchTypeEnum } from '@/models/match';
import type { SwissRound } from '@/models/swiss';
import { groupBy } from '@/stores/tournament.store';

const { swiss, teamPerMatch } = defineProps<{
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
      class="u-text-center text-3xl"
    >
      Tour {{ round_idx }}
    </h1>
    <div
      v-for="(round_matchs, round_idx) in groupBy(swiss.matchs, 'round_number')"
      :key="round_idx"
      class="l-flex-column gap-6"
    >
      <div
        v-for="(matchs, score_group) in groupBy(round_matchs, 'score_group')"
        :key="score_group"
        class="border-2 border-gray-500"
      >
        <div
          class="bg-gray-500 u-text-center"
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
          class="l-flex-column l-items-cross-center"
        >
          <div
            v-for="match in matchs"
            :key="match.id"
            class="u-full-width"
          >
            <MatchCard
              :match="match"
              :match-type="{ type: MatchTypeEnum.SWISS, id: match.swiss }"
              :team-per-match="teamPerMatch"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
