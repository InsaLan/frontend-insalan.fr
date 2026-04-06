<script setup lang="ts">
import { storeToRefs } from 'pinia';
import PaymentStatusIcon from '@/components/PaymentStatusIcon.vue';
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
  <div v-if="typeof team !== 'number'" class="c-card-bg-2 u-full-width u-full-height">
    <div class="u-text-center u-big-text u-bold">
      {{ team.name }}
      <fa-awesome-icon
        v-if="team.validated"
        alt="Icone correct"
        icon="fa-solid fa-check"
        class="c-inline-icon u-color-correct-1"
        title="Cette équipe a été validée"
      />
    </div>
    <ul>
      <li v-for="player in team.players" :key="((player as PlayerRegistration).user)">
        {{ (player as PlayerRegistration).name_in_game }}
        <PaymentStatusIcon :player="player as PlayerRegistration"/>
      </li>
    </ul>
    <div v-if="team.substitutes.length > 0">
      <p class="u-big-text">
        Remplaçant·e{{ team.substitutes.length > 1 ? '·s' : '' }} :
      </p>
      <ul>
        <li v-for="player in team.substitutes" :key="((player as PlayerRegistration).user)">
          {{ (player as PlayerRegistration).name_in_game }}
          <PaymentStatusIcon :player="player as PlayerRegistration"/>
        </li>
      </ul>
    </div>
    <div v-if="team.managers.length > 0" class="u-big-text">
      <p class="u-big-text">
        Manager{{ team.managers.length > 1 ? 's' : '' }} :
      </p>
      <ul>
        <li v-for="manager in team.managers" :key="manager">
          {{ manager }}
        </li>
      </ul>
    </div>
  </div>
</template>
