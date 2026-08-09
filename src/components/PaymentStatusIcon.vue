<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PlayerRegistration } from '@/models/registration';
import { PaymentStatus } from '@/models/registration';

defineProps<{
  player: PlayerRegistration;
}>();

const { t } = useI18n();
</script>

<template>
  <fa-awesome-icon
    v-if="player.payment_status === PaymentStatus.PAID"
    :alt="t('content.components.PaymentStatusIcon.paidIconAlt')"
    icon="fa-circle-check"
    class="c-inline-icon u-color-correct-1"
    :title="t('content.components.PaymentStatusIcon.paid')"
  />
  <fa-awesome-icon
    v-if="player.payment_status === PaymentStatus.LATER"
    :alt="t('content.components.PaymentStatusIcon.laterIconAlt')"
    icon="fa-clock"
    class="c-inline-icon u-color-warn-1"
    :title="t('content.components.PaymentStatusIcon.later')"
  />
</template>
