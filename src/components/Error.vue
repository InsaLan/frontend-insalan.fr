<script setup lang="ts">
// TODO: Refactor to Toast component
import { storeToRefs } from 'pinia';
import { useErrorStore } from '@/stores/error.store';

const ErrorStore = useErrorStore();
const { flush_errors } = ErrorStore;
const { errors, has_errors } = storeToRefs(ErrorStore);
</script>
<template>
  <div
    v-if="has_errors"
    class="w-min-[500px] fixed bottom-1 left-1/2 z-40 mb-4 flex w-full max-w-xs items-center rounded-lg bg-white p-4 text-gray-500 shadow hover:ring-2 hover:ring-red-950 dark:bg-red-800 dark:text-red-400"
  >
    <div class="ml-3 text-sm font-normal">
      <ul>
        <li v-for="error in errors" :key="error[0]">
          <em class="text-xl font-bold not-italic">- {{ error[0] }}</em>
          <p>{{ error[1] }}</p>
        </li>
      </ul>
    </div>
    <button
      class="-m-1.5 ml-auto inline-flex size-8 items-center justify-center rounded-lg p-1.5 hover:bg-red-600 hover:text-white hover:ring-2 hover:ring-red-600 "
      type="button"
      @click="flush_errors"
    >
      <span class="sr-only">Close</span>
      <svg
        class="size-5 stroke-2"
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
