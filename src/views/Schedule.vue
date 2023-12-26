<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useContentStore } from '@/stores/content.store';

const contentStore = useContentStore();
const { getContent } = contentStore;
</script>

<template>
  <div v-if="!getContent('planning')" class="flex justify-center">
    Le planning n'est pas encore disponible, revenez plus tard !
  </div>
  <div class="flex justify-center">
    <div class="m-2 overflow-auto overscroll-y-auto">
      <content name="planning"/>
    </div>
  </div>
</template>
