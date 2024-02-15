<script setup lang="ts">
import KnockoutMatchCard from '@/components/KnockoutMatchCard.vue';

defineProps<{
  rounds: Record<string, Record<string, string | Record<string, string | number | boolean | undefined>[]>[]>;
  teamPerMatch: number;
  roundCount: number;
}>();
</script>

<template>
  <div class="grid items-center gap-3" :class="`grid-cols-${roundCount}`">
    <div v-for="round_idx in roundCount" :key="round_idx" class>
      <div v-for="(match, idx) in rounds[round_idx]" :key="idx">
        <KnockoutMatchCard
          :team-per-match="teamPerMatch"
          :teams="(match.teams as Record<string, string | number | boolean | undefined>[])"
          :status="(match.status as string)"
        />
      </div>
    </div>
  </div>
</template>
