<script setup lang="ts">
import { storeToRefs } from 'pinia';
import PaymenStatusIcon from '@/components/PaymenStatusIcon.vue';
import type { PlayerRegistration } from '@/models/registration';
import type { Team } from '@/models/team';
import { useUserStore } from '@/stores/user.store';

storeToRefs(useUserStore());

defineProps<{
  team: Team;
  soloGame?: boolean;
}>();
</script>

<template>
  <div v-if="typeof team !== 'number'" class="overflow-hidden text-ellipsis rounded bg-cyan-500 u-p-2">
    <h1 class="text-shadow u-text-center text-3xl font-black">
      {{ team.name }}
      <img v-if="team.validated" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="inline-block size-6"/>
    </h1>
    <ul
      class="u-ml-2 list-disc text-xl"
    >
      <li v-for="player in team.players" :key="((player as PlayerRegistration).user)">
        <p>
          {{ (player as PlayerRegistration).name_in_game }}
          <PaymenStatusIcon :player="player as PlayerRegistration"/>
        </p>
      </li>
    </ul>
    <p v-if="team.managers.length" class="text-2xl">
      Managers : <em>{{ team.managers.join(', ') }}</em>
    </p>
    <div v-if="team.substitutes.length" class="text-2xl">
      Remplaçant :
      <ul class="u-ml-2 list-disc text-xl">
        <li v-for="player in team.substitutes" :key="((player as PlayerRegistration).user)">
          <p>
            {{ (player as PlayerRegistration).name_in_game }}
            <PaymenStatusIcon :player="player as PlayerRegistration"/>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
