<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useContentStore } from '@/stores/content.store';

const store = useContentStore();
</script>

<template>
  <div class="l-flex-column l-items-main-center u-full-height">
    <h1>
      L'association InsaLan
    </h1>
    <Content
      class="u-m-text l-flex-column l-gap-4 u-text-indent u-mb-4"
      name="Association"
    />
    <!-- TODO: fix this loading weirdly -->
    <img
      aria-hidden="true"
      :src="store.getFile('lan')"
      alt=""
      class="c-background-image"
    />
  </div>
</template>
