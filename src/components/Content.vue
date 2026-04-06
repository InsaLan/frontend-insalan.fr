<script setup lang="ts">
import { useContentStore } from '@/stores/content.store';

interface Props {
  name: string;
}

const props = defineProps<Props>();

const contentStore = useContentStore();
const { getContent } = contentStore;

</script>

<template>
  <!-- we trust this HTML content -->
  <!-- eslint-disable -->
  <section
    v-html="getContent(props.name)"
  >
  </section>
</template>
