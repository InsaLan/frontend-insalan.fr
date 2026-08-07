<script setup lang="ts">
import Content from '@/components/Content.vue';
import { useContentStore } from '@/stores/content.store';

const store = useContentStore();
</script>

<template>
  <div class="l-flex-column l-main-center u-full-height">
    <h1 class="u-mt-2">
      {{ $t('content.Association.title') }}
    </h1>
    <Content
      class="u-m-text l-flex-column l-gap-4 u-text-indent u-mb-4"
      name="Association"
    />
    <img
      aria-hidden="true"
      :src="store.getFile('lan')"
      alt=""
      class="c-background-image"
    />
  </div>
</template>
