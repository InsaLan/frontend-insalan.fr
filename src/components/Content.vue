<script setup lang="ts">
import i18n from '@/i18n';
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
  <!-- eslint-disable-next-line vue/no-v-html -->
  <section v-html="getContent(props.name, i18n.global.locale.value)"/>
</template>
