import { defineStore } from 'pinia';
import { ref } from 'vue';

type ToastStatus = 'success' | 'error' | 'info';

export const useToastStore = defineStore('toast', () => {
  const msg = ref('');
  const visible = ref(false);
  const toastType = ref<ToastStatus>('success');

  function setContent(content: string, status: ToastStatus) {
    msg.value = content;
    toastType.value = status;
    visible.value = true;
  }

  function dismiss() {
    msg.value = '';
    visible.value = false;
  }

  return {
    msg,
    toastType,
    visible,
    setContent,
    dismiss,
  };
});
