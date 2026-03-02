<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notification.store';

const NotificationStore = useNotificationStore();
const { notifications } = storeToRefs(NotificationStore);
const { removeNotification } = NotificationStore;
</script>
<template>
  <div class="notification-area l-flex-column l-items-cross-end l-gap-1 u-m-2">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification l-flex-row l-items-cross-start l-gap-1"
        :class="{
          'c-card-error': notification.type === 'error',
          'c-card-correct': notification.type === 'info',
          'c-card-warn': notification.type === 'warn',
        }"
      >
        <div class="u-text-left">
          {{ notification.message }}
        </div>
        <button
          type="button"
          class="c-image-btn"
          @click="removeNotification(notification.id)"
        >
          <fa-awesome-icon
            icon="fa-times"
          />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-move,
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.notification-leave-active {
  position: absolute;
}

.notification-area {
  position: fixed;
  bottom: 0;
  right: 0;
  transform: translateX(0);
  z-index: 100;
}

.notification {
  max-width: 24rem;
}
</style>
