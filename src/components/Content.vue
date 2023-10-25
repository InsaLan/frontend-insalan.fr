<script setup lang="ts">
import { useContentStore } from '../stores/content.store';

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
  <div v-html="getContent(props.name)"/>
</template>

<style scoped>
</style>
