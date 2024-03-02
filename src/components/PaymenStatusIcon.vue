<script setup lang="ts">
import type { PlayerRegistration } from '@/models/registration';
import { PaymentStatus } from '@/models/registration';

defineProps<{
  player: PlayerRegistration;
}>();
</script>

<template>
  <img
    v-if="player.payment_status === PaymentStatus.PAID"
    src="/src/assets/images/check_with_bg.svg"
    alt="Logo validé"
    class="inline-block h-5 w-5"
    title="Ce joueur a payé"
  />
  <fa-awesome-icon
    v-if="player.payment_status === PaymentStatus.LATER"
    class="clock-icon h-5 w-5 rounded-full bg-white text-yellow-400"
    icon="fa-solid fa-clock"
    title="Ce joueur payera sur place"
  />
</template>
