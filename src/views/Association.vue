<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useContentStore } from '@/stores/content.store';

const store = useContentStore();

</script>

<template>
  <h1 class="c-title">
    L'association InsaLan
  </h1>
  <Content
    class="u-m-body l-flex-column l-gap-4 u-text-indent"
    name="Association"
  />
  <img
    aria-hidden="true"
    :src="store.getFile('lan')"
    alt=""
    class="background-image u-full-width u-full-height"
  />
</template>

<style scoped>
.background-image {
  position: fixed;
  inset: 0;
  display: block;
  object-fit: cover;
  object-position: center;
  opacity: 0.15;
  z-index: -1;
  pointer-events: none;
}
</style>
