<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const { clear_cart } = userStore;

enum ReturnType {
  RETURN = 'return',
  REFUSED = 'refused',
}
enum ReturnState {
  SUCCEEDED = 'succeeded',
  REFUSED = 'refused',
}
const props = defineProps<{
  status: { type: ReturnType; code?: string; error?: string };
}>();

onMounted(async () => {
  if (props.status.type === ReturnType.RETURN && props.status.code === ReturnState.SUCCEEDED) {
    clear_cart();
  }
  await userStore.fetchUser();
});

</script>

<template>
  <div v-if="status.type === ReturnType.RETURN" class="l-flex-column l-cross-center l-main-center u-full-height">
    <div v-if="status.code === ReturnState.REFUSED" class="u-color-error-1 u-big-text">
      {{ $t('content.ReturnPayment.refused') }}
    </div>
    <div v-else-if="status.code === ReturnState.SUCCEEDED" class="l-flex-column l-cross-center l-main-center u-full-height u-big-text">
      {{ $t('content.ReturnPayment.succeeded') }}
      <RouterLink to="/me" class="c-btn-primary">
        {{ $t('content.ReturnPayment.backToProfile') }}
      </RouterLink>
    </div>
    <div v-else class="u-color-error-1 u-big-text">
      {{ $t('content.ReturnPayment.unknownError') }}
    </div>
  </div>
  <div v-else-if="status.type === ReturnType.REFUSED" class="l-flex-column l-cross-center l-main-center u-full-height u-color-error-1 u-big-text">
    {{ $t('content.ReturnPayment.processingError') }}
    <p>{{ status.error }}</p>
  </div>
  <div v-else class="l-flex-column l-cross-center l-main-center u-full-height u-color-error-1 u-big-text">
    {{ $t('content.ReturnPayment.unknownError') }}
  </div>
</template>
