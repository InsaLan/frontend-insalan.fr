<script setup lang="ts">
import type { PrivateTournament } from '@/models/tournament';

defineProps<{
  tournament: PrivateTournament;
}>();

</script>
<template>
  <div class="grid place-items-center gap-2 bg-cyan-900 shadow-lg">
    <img
      :alt="`Logo du ${tournament?.name}`"
      :src="tournament?.logo"
      class="max-w-screen aspect-video text-clip"
    />
    <p class="text-lg">
      {{ tournament?.validated_teams }}/{{ tournament?.maxTeam }} Équipes |
    </p>
    <div class="mb-3 flex w-4/5 justify-center gap-3 text-center">
      <router-link :to="`tournament/${tournament?.id as number}/info`" class="rounded border-2 border-green-600 p-2 text-lg hover:border-green-500">
        Plus d'infos
      </router-link>
      <router-link
        :to="`tournament/${tournament?.id as number}/register`"
        class="rounded bg-green-600 p-2 text-lg hover:bg-green-500"
      >
        S'inscrire
      </router-link>
    </div>
  </div>
</template>
