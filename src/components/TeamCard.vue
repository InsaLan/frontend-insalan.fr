<script setup lang="ts">
import type { Team } from '../models/team';

defineProps<{
  team: Team;
}>();
</script>

<template>
  <div class="overflow-hidden text-ellipsis rounded bg-cyan-500">
    <h1 class="text-center text-xl font-black">
      {{ team.id }}. {{ team.name }}
    </h1>
    <ul class="mx-1">
      <li v-for="player in team.players" :key="player">
        <p class="">
          {{ player }}
        </p>
      </li>
    </ul>
    <p class="text-grey-400">
      Managers: <em v-for="manager in team.managers" :key="manager">manager</em>
    </p>
  </div>
</template>
