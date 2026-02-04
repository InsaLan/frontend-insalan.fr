<script setup lang="ts">
import type { PrivateTournament } from '@/models/tournament';

defineProps<{
  tournament: PrivateTournament;
}>();

</script>
<template>
  <div class="grid c-card-bg-2-nopad u-pb-2">
    <img
      :alt="`Logo du ${tournament?.name}`"
      :src="tournament?.logo"
      class="aspect-video u-full-width overflow-hidden object-cover u-rounded"
    />
    <p class="text-lg">
      {{ tournament?.validated_teams }}/{{ tournament?.max_team_thresholds[tournament?.current_threshold_index] }}
      Équipes
    </p>
    <div class="flex w-4/5 l-items-main-center l-gap-2 u-text-center">
      <router-link :to="`tournament/private/${tournament?.id as number}/info`" class="c-btn-bg-3">
        Plus d'infos
      </router-link>
      <router-link
        :to="`tournament/private/${tournament?.id as number}/register`"
        class="c-btn-secondary"
      >
        S'inscrire
      </router-link>
    </div>
  </div>
</template>
