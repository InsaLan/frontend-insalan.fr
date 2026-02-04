<script setup lang="ts">
import { toRefs } from 'vue';
import type { Partner } from '@/models/partner';

interface Props {
  partner: Partner;
}

const props = defineProps<Props>();
const { partner } = toRefs(props);
</script>

<template>
  <a :key="partner.id" :href="partner.url" class="partner c-btn-bg-2 l-flex-column l-items-cross-center" target="_blank" rel="noopener noreferrer">
    <img :src="partner.logo" :alt="`logo de ${partner.name}`" class="u-full-height"/>
    <p class="u-text-center">{{ partner.name }}</p>
  </a>
</template>

<style scoped>
.partner {
  height: 12rem;
}
</style>
