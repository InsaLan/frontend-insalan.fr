<script setup lang="ts">
import type { PrivateTournament } from '@/models/tournament';

defineProps<{
  tournament: PrivateTournament;
}>();

</script>
<template>
  <div class="l-flex-column l-items-cross-center c-card-bg-2 u-p-0 u-pb-2 l-gap-2 u-full-width">
    <img
      :alt="`Logo du ${tournament?.name}`"
      :src="tournament?.logo"
      class="c-thumbnail"
    />
    <p class="u-big-text">
      {{ tournament?.validated_teams }}/{{ tournament?.max_team_thresholds[tournament?.current_threshold_index] }}
      Équipes
    </p>
    <div class="l-flex-row l-items-main-center l-items-cross-center l-gap-2">
      <router-link
        :to="`tournament/private/${tournament?.id as number}/info`"
        class="c-btn-bg-3"
      >
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
