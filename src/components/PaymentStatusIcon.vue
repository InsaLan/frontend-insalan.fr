<script setup lang="ts">
import type { PlayerRegistration } from '@/models/registration';
import { PaymentStatus } from '@/models/registration';

defineProps<{
  player: PlayerRegistration;
}>();
</script>

<template>
  <fa-awesome-icon
    v-if="player.payment_status === PaymentStatus.PAID"
    alt="Icone correct"
    icon="fa-solid fa-circle-check"
    class="c-inline-icon u-color-correct-1"
    title="Ce·tte joueur·euse a payé"
  />
  <fa-awesome-icon
    v-if="player.payment_status === PaymentStatus.LATER"
    alt="Icone horloge"
    icon="fa-solid fa-clock"
    class="c-inline-icon u-color-warn-1"
    title="Ce·tte joueur·euse paiera sur place"
  />
</template>
