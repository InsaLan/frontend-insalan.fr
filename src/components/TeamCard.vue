<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { Team } from '@/models/team';
import { useUserStore } from '@/stores/user.store';

const { user } = storeToRefs(useUserStore());

defineProps<{
  team: Team | number;
}>();
</script>

<template>
  <div v-if="typeof team !== 'number'" class="overflow-hidden text-ellipsis rounded bg-cyan-500 p-4">
    <h1 class="text-shadow text-center text-3xl font-black" :class="{ 'after:inline-block after:h-6 after:w-6  after:content-[url(\'/src/assets/images/check_with_bg.svg\')]': user.is_staff && team.validated }">
      {{ team.name }}
    </h1>
    <ul class="ml-4 list-disc text-xl">
      <li v-for="player in team.players" :key="player.user">
        <p class="">
          {{ player.pseudo }}
        </p>
      </li>
    </ul>
    <p class="text-2xl">
      Managers : <em>{{ team.managers.join(', ') }}</em>
    </p>
  </div>
</template>
