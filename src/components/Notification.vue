<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notification.store';

const NotificationStore = useNotificationStore();
const { notifications } = storeToRefs(NotificationStore);
const { removeNotification } = NotificationStore;
</script>
<template>
  <div class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 space-y-2">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="flex max-w-sm items-center justify-between gap-2 rounded-lg p-4 text-white shadow-lg transition-all duration-300 ease-in-out"
        :class="{
          'bg-red-500': notification.type === 'error',
          'bg-green-500': notification.type === 'info',
          'bg-orange-500': notification.type === 'warn',
        }"
      >
        <div>
          {{ notification.message }}
        </div>
        <button
          type="button"
          class="rounded-full p-1 hover:bg-red-600"
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
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
