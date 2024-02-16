<script setup lang="ts">
import KnockoutMatchCard from '@/components/KnockoutMatchCard.vue';

defineProps<{
  rounds: Record<string, Record<string, string | Record<string, string | number | boolean | undefined>[]>[]>;
  teamPerMatch: number;
  roundCount: number;
}>();
</script>

<template>
  <div class="grid h-full items-center gap-x-20 gap-y-5" :style="{ 'grid-template-columns': `repeat(${roundCount},26rem)` }">
    <div v-for="round_idx in roundCount" :key="round_idx" class="flex flex-col">
      <h1 class="text-4xl">
        Tour {{ round_idx }}
      </h1>
    </div>
    <div v-for="round_idx in roundCount" :key="round_idx" class="flex flex-col">
      <div v-for="(match, idx) in rounds[round_idx]" :key="idx" class="my-3 divide-y">
        <KnockoutMatchCard
          :team-per-match="teamPerMatch"
          :teams="(match.teams as Record<string, string | number | boolean | undefined>[])"
          :status="(match.status as string)"
        />
      </div>
    </div>
  </div>
</template>
