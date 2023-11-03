<script setup lang="ts">
import type { Team } from '@/models/team';

defineProps<{
  team: Team;
}>();
</script>

<template>
  <div class="overflow-hidden text-ellipsis rounded bg-cyan-500 p-4">
    <h1 class="text-center text-3xl font-black after:inline-block after:h-6 after:w-6 after:content-[url('/src/assets/images/check_with_bg.svg')]">
      {{ team.name }}
      <!--<fa-awesome-icon
        class="relative z-10 text-white"
        icon="fa-circle"
        size="sm"
        title="Équipe validée"
      />
      <fa-awesome-icon
        class="relative z-20 -left- text-green-600"
        icon="fa-circle-check"
        size="lg"
        title="Équipe validée"
      />
      -->
    </h1>
    <ul class="ml-4 list-disc text-xl">
      <li v-for="player in team.players" :key="player">
        <p>{{ player }}</p>
      </li>
    </ul>
    <p class="text-2xl">
      Managers: <em v-for="manager in team.managers" :key="manager">{{ manager }}</em>
    </p>
  </div>
</template>
