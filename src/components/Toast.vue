<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/toast.store';

const ToastStore = useToastStore();
const { msg, visible, toastType } = storeToRefs(ToastStore);
const { dismiss } = ToastStore;
</script>
<template>
  <div
    v-if="visible"
    :class="toastType"
    class="w-min-[500px] fixed bottom-1 left-1/2 z-40 mb-4 ml-[-250px] flex w-full max-w-xs items-center rounded-lg p-4 text-white shadow hover:ring-2"
  >
    <div class="ml-3 text-sm font-normal">
      <p>{{ msg }}</p>
    </div>
    <button
      class="-m-1.5 ml-auto inline-flex size-8 items-center justify-center rounded-lg p-1.5 hover:bg-green-600 hover:text-white hover:ring-2 hover:ring-green-600"
      type="button"
      @click="dismiss"
    >
      <span class="sr-only">Close</span>
      <svg
        class="size-5 stroke-2 text-white"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path class="size-5" d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>
