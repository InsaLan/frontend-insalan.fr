import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Notification {
  id: number;
  message: string;
  type: 'error' | 'info';
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);

  function removeNotification(id: number) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  function addNotification(
    message: string | string[] | { [key: string]: string },
    type: 'error' | 'info',
  ) {
    if (Array.isArray(message)) {
      message.forEach((m) => addNotification(m, type));
      return;
    }
    if (typeof message === 'object') {
      Object.keys(message).forEach((key) => addNotification(message[key], type));
      return;
    }
    const id = Date.now();
    notifications.value.push({ id, message, type });
    setTimeout(() => removeNotification(id), 5000); // Remove after 5 seconds
  }

  return {
    notifications,
    addNotification,
    removeNotification,
  };
});
